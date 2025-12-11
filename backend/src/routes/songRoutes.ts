import { Router } from "express";
import prisma from "../db/prisma.js";
import { transposeLyrics } from "../utils/transposeUtils.js";
import {
  normalizeLyrics,
  convertInlineToChordOverLyrics,
} from "../utils/lyricsParser.js";
import { z } from "zod";

const router = Router();

// Validation schemas
const createSongSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  artist: z.string().min(1, "Artista é obrigatório"),
  originalKey: z.string().min(1, "Tom original é obrigatório"),
  lyrics: z.string().min(1, "Letra é obrigatória"),
});

const updateSongSchema = createSongSchema.partial();

// GET /api/songs - Listar todas as músicas
router.get("/", async (req, res) => {
  try {
    const { search, artist, skip = "0", take = "20" } = req.query;

    let songs;

    if (search) {
      // Busca case-insensitive usando raw SQL
      const searchLower = (search as string).toLowerCase();
      songs = await prisma.$queryRaw`
        SELECT * FROM Song 
        WHERE LOWER(title) LIKE ${"%" + searchLower + "%"} 
           OR LOWER(artist) LIKE ${"%" + searchLower + "%"}
        ORDER BY title ASC
        LIMIT ${parseInt(take as string)} 
        OFFSET ${parseInt(skip as string)}
      `;
    } else if (artist) {
      const artistLower = (artist as string).toLowerCase();
      songs = await prisma.$queryRaw`
        SELECT * FROM Song 
        WHERE LOWER(artist) LIKE ${"%" + artistLower + "%"}
        ORDER BY title ASC
        LIMIT ${parseInt(take as string)} 
        OFFSET ${parseInt(skip as string)}
      `;
    } else {
      songs = await prisma.song.findMany({
        skip: parseInt(skip as string),
        take: parseInt(take as string),
        orderBy: { title: "asc" },
      });
    }

    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Erro ao buscar músicas" });
  }
});

// GET /api/songs/:id - Buscar uma música específica
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { key, format } = req.query;

    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song) {
      return res.status(404).json({ error: "Música não encontrada" });
    }

    let lyrics = song.lyrics;
    let currentKey = song.originalKey;

    // Se um tom diferente for solicitado, transpor
    if (key && key !== song.originalKey) {
      lyrics = transposeLyrics(song.lyrics, song.originalKey, key as string);
      currentKey = key as string;
    }

    // Se formato 'separated' for solicitado, converter para linhas separadas
    if (format === "separated") {
      lyrics = convertInlineToChordOverLyrics(lyrics);
    }

    res.json({
      ...song,
      lyrics,
      currentKey,
    });
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ error: "Erro ao buscar música" });
  }
});

// POST /api/songs - Criar nova música
router.post("/", async (req, res) => {
  try {
    const validatedData = createSongSchema.parse(req.body);

    // Normaliza a letra (aceita formato inline ou linhas separadas)
    const normalizedLyrics = normalizeLyrics(validatedData.lyrics);

    const song = await prisma.song.create({
      data: {
        ...validatedData,
        lyrics: normalizedLyrics,
      },
    });

    res.status(201).json(song);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Error creating song:", error);
    res.status(500).json({ error: "Erro ao criar música" });
  }
});

// PUT /api/songs/:id - Atualizar música
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateSongSchema.parse(req.body);

    // Normaliza a letra se foi fornecida
    const dataToUpdate = { ...validatedData };
    if (dataToUpdate.lyrics) {
      dataToUpdate.lyrics = normalizeLyrics(dataToUpdate.lyrics);
    }

    const song = await prisma.song.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(song);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Error updating song:", error);
    res.status(500).json({ error: "Erro ao atualizar música" });
  }
});

// POST /api/songs/:id/transpose - Transpor música e salvar com novo tom
router.post("/:id/transpose", async (req, res) => {
  try {
    const { id } = req.params;
    const { newKey } = req.body;

    if (!newKey) {
      return res.status(400).json({ error: "Novo tom é obrigatório" });
    }

    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song) {
      return res.status(404).json({ error: "Música não encontrada" });
    }

    // Transpõe a letra para o novo tom
    const transposedLyrics = transposeLyrics(
      song.lyrics,
      song.originalKey,
      newKey
    );

    // Atualiza a música com o novo tom e letra transposta
    const updatedSong = await prisma.song.update({
      where: { id },
      data: {
        originalKey: newKey,
        lyrics: transposedLyrics,
      },
    });

    res.json(updatedSong);
  } catch (error) {
    console.error("Error transposing song:", error);
    res.status(500).json({ error: "Erro ao transpor música" });
  }
});

// DELETE /api/songs/:id - Deletar música
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a música está em alguma playlist
    const playlistSongs = await prisma.playlistSong.findMany({
      where: { songId: id },
      include: {
        playlist: {
          select: { name: true },
        },
      },
    });

    if (playlistSongs.length > 0) {
      const playlistNames = playlistSongs
        .map((ps) => ps.playlist.name)
        .join(", ");
      return res.status(400).json({
        error: "Não é possível excluir esta música",
        message: `Esta música está sendo usada nas seguintes playlists: ${playlistNames}. Remova-a das playlists primeiro.`,
      });
    }

    await prisma.song.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({ error: "Erro ao deletar música" });
  }
});

export default router;
