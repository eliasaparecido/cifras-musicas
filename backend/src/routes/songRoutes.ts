import { Router } from "express";
import prisma from "../db/prisma.js";
import { transposeLyrics } from "../utils/transposeUtils.js";
import { normalizeLyrics } from "../utils/lyricsParser.js";
import { canEditResource, requireAuthUser } from "../utils/requestAuth.js";
import { z } from "zod";

const router = Router();

const createSongSchema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  artist: z.string().min(1, "Artista e obrigatorio"),
  originalKey: z.string().min(1, "Tom original e obrigatorio"),
  lyrics: z.string().min(1, "Letra e obrigatoria"),
  isPublic: z.boolean().optional(),
});

const updateSongSchema = createSongSchema.partial();

router.get("/", async (req, res) => {
  try {
    const { search, artist, skip = "0", take = "20" } = req.query;

    let songs;

    if (search) {
      const searchLower = (search as string).toLowerCase();
      songs = await prisma.$queryRaw`
        SELECT * FROM Song
        WHERE LOWER(title) LIKE ${"%" + searchLower + "%"}
           OR LOWER(artist) LIKE ${"%" + searchLower + "%"}
        ORDER BY createdAt DESC, id DESC
        LIMIT ${parseInt(take as string, 10)}
        OFFSET ${parseInt(skip as string, 10)}
      `;
    } else if (artist) {
      const artistLower = (artist as string).toLowerCase();
      songs = await prisma.$queryRaw`
        SELECT * FROM Song
        WHERE LOWER(artist) LIKE ${"%" + artistLower + "%"}
        ORDER BY createdAt DESC, id DESC
        LIMIT ${parseInt(take as string, 10)}
        OFFSET ${parseInt(skip as string, 10)}
      `;
    } else {
      songs = await prisma.song.findMany({
        skip: parseInt(skip as string, 10),
        take: parseInt(take as string, 10),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
    }

    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Erro ao buscar musicas" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song) {
      return res.status(404).json({ error: "Musica nao encontrada" });
    }

    res.json(song);
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ error: "Erro ao buscar musica" });
  }
});

router.post("/", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const validatedData = createSongSchema.parse(req.body);

    const song = await prisma.song.create({
      data: {
        title: validatedData.title,
        artist: validatedData.artist,
        originalKey: validatedData.originalKey,
        lyrics: normalizeLyrics(validatedData.lyrics),
        isPublic: validatedData.isPublic ?? true,
        ownerId: authUser.id,
      },
    });

    res.status(201).json(song);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Dados invalidos", details: error.errors });
    }
    console.error("Error creating song:", error);
    res.status(500).json({ error: "Erro ao criar musica" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { id } = req.params;
    const existingSong = await prisma.song.findUnique({ where: { id } });

    if (!existingSong) {
      return res.status(404).json({ error: "Musica nao encontrada" });
    }

    if (!canEditResource(existingSong.ownerId, existingSong.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para editar esta musica" });
    }

    const validatedData = updateSongSchema.parse(req.body);
    const dataToUpdate = { ...validatedData } as {
      title?: string;
      artist?: string;
      originalKey?: string;
      lyrics?: string;
      isPublic?: boolean;
    };

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
        .json({ error: "Dados invalidos", details: error.errors });
    }
    console.error("Error updating song:", error);
    res.status(500).json({ error: "Erro ao atualizar musica" });
  }
});

router.post("/:id/transpose", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { id } = req.params;
    const { newKey } = req.body;

    if (!newKey) {
      return res.status(400).json({ error: "Novo tom e obrigatorio" });
    }

    const song = await prisma.song.findUnique({ where: { id } });

    if (!song) {
      return res.status(404).json({ error: "Musica nao encontrada" });
    }

    if (!canEditResource(song.ownerId, song.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para transpor esta musica" });
    }

    const transposedLyrics = transposeLyrics(song.lyrics, song.originalKey, newKey);

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
    res.status(500).json({ error: "Erro ao transpor musica" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { id } = req.params;

    const existingSong = await prisma.song.findUnique({ where: { id } });
    if (!existingSong) {
      return res.status(404).json({ error: "Musica nao encontrada" });
    }

    if (!canEditResource(existingSong.ownerId, existingSong.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para excluir esta musica" });
    }

    const playlistSongs = await prisma.playlistSong.findMany({
      where: { songId: id },
      include: {
        playlist: {
          select: { name: true },
        },
      },
    });

    if (playlistSongs.length > 0) {
      const playlistNames = playlistSongs.map((ps: any) => ps.playlist.name).join(", ");
      return res.status(400).json({
        error: "Nao e possivel excluir esta musica",
        message: `Esta musica esta sendo usada nas seguintes playlists: ${playlistNames}. Remova-a das playlists primeiro.`,
      });
    }

    await prisma.song.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({ error: "Erro ao deletar musica" });
  }
});

export default router;
