import { Router } from "express";
import prisma from "../db/prisma.js";
import { canEditResource, requireAuthUser } from "../utils/requestAuth.js";
import { z } from "zod";

const router = Router();

const createPlaylistSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const duplicatePlaylistSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
});

const addSongToPlaylistSchema = z.object({
  songId: z.string().uuid("ID da musica invalido"),
  key: z.string().min(1, "Tom e obrigatorio"),
  order: z.number().int().min(0),
});

router.get("/", async (req, res) => {
  try {
    const { search, skip = "0", take = "20" } = req.query;

    const playlists = search
      ? await (async () => {
        const searchLower = (search as string).toLowerCase();
        const playlistIds: Array<{ id: string }> = await prisma.$queryRaw`
        SELECT id FROM Playlist
        WHERE LOWER(name) LIKE ${"%" + searchLower + "%"}
           OR LOWER(description) LIKE ${"%" + searchLower + "%"}
          ORDER BY createdAt DESC, id DESC
        LIMIT ${parseInt(take as string, 10)}
        OFFSET ${parseInt(skip as string, 10)}
      `;

        if (playlistIds.length > 0) {
          return prisma.playlist.findMany({
            where: {
              id: { in: playlistIds.map((p) => p.id) },
            },
            include: {
              songs: {
                include: {
                  song: true,
                },
                orderBy: { order: "asc" },
              },
            },
              orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          });
        }

        return [];
      })()
      : await prisma.playlist.findMany({
        skip: parseInt(skip as string, 10),
        take: parseInt(take as string, 10),
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          songs: {
            include: {
              song: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

    res.json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Erro ao buscar playlists" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist nao encontrada" });
    }

    res.json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Erro ao buscar playlist" });
  }
});

router.post("/", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const validatedData = createPlaylistSchema.parse(req.body);

    const playlist = await prisma.playlist.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        isPublic: validatedData.isPublic ?? false,
        ownerId: authUser.id,
      },
      include: {
        songs: {
          include: {
            song: true,
          },
        },
      },
    });

    res.status(201).json(playlist);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados invalidos", details: error.errors });
    }
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Erro ao criar playlist" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { id } = req.params;
    const existing = await prisma.playlist.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: "Playlist nao encontrada" });
    }

    if (!canEditResource(existing.ownerId, existing.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para editar esta playlist" });
    }

    const validatedData = createPlaylistSchema.partial().parse(req.body);

    const playlist = await prisma.playlist.update({
      where: { id },
      data: validatedData,
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    res.json(playlist);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados invalidos", details: error.errors });
    }
    console.error("Error updating playlist:", error);
    res.status(500).json({ error: "Erro ao atualizar playlist" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { id } = req.params;
    const existing = await prisma.playlist.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: "Playlist nao encontrada" });
    }

    if (!canEditResource(existing.ownerId, existing.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para excluir esta playlist" });
    }

    await prisma.playlist.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({ error: "Erro ao deletar playlist" });
  }
});

router.post("/:id/duplicate", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { id } = req.params;
    const validatedData = duplicatePlaylistSchema.parse(req.body);

    const originalPlaylist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!originalPlaylist) {
      return res.status(404).json({ error: "Playlist nao encontrada" });
    }

    if (!canEditResource(originalPlaylist.ownerId, originalPlaylist.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para duplicar esta playlist" });
    }

    const newPlaylist = await prisma.playlist.create({
      data: {
        name: validatedData.name,
        description: originalPlaylist.description,
        isPublic: originalPlaylist.isPublic,
        ownerId: authUser.id,
        songs: {
          create: originalPlaylist.songs.map((song: any) => ({
            songId: song.songId,
            key: song.key,
            order: song.order,
          })),
        },
      },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    res.status(201).json(newPlaylist);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados invalidos", details: error.errors });
    }
    console.error("Error duplicating playlist:", error);
    res.status(500).json({ error: "Erro ao duplicar playlist" });
  }
});

router.post("/:id/songs", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { id } = req.params;
    const playlist = await prisma.playlist.findUnique({ where: { id } });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist nao encontrada" });
    }

    if (!canEditResource(playlist.ownerId, playlist.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para editar esta playlist" });
    }

    const validatedData = addSongToPlaylistSchema.parse(req.body);

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: id,
        ...validatedData,
      },
      include: {
        song: true,
      },
    });

    res.status(201).json(playlistSong);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados invalidos", details: error.errors });
    }
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ error: "Erro ao adicionar musica a playlist" });
  }
});

router.delete("/:playlistId/songs/:songId", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { playlistId, songId } = req.params;
    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist nao encontrada" });
    }

    if (!canEditResource(playlist.ownerId, playlist.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para editar esta playlist" });
    }

    await prisma.playlistSong.deleteMany({
      where: {
        playlistId,
        songId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    res.status(500).json({ error: "Erro ao remover musica da playlist" });
  }
});

router.put("/:playlistId/songs/:songId", async (req, res) => {
  try {
    const authUser = await requireAuthUser(req, res);
    if (!authUser) {
      return;
    }

    const { playlistId, songId } = req.params;
    const { key, order } = req.body;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist nao encontrada" });
    }

    if (!canEditResource(playlist.ownerId, playlist.isPublic, authUser)) {
      return res.status(403).json({ error: "Sem permissao para editar esta playlist" });
    }

    const data: { key?: string; order?: number } = {};
    if (key) data.key = key;
    if (order !== undefined) data.order = order;

    const playlistSong = await prisma.playlistSong.updateMany({
      where: {
        playlistId,
        songId,
      },
      data,
    });

    res.json(playlistSong);
  } catch (error) {
    console.error("Error updating playlist song:", error);
    res.status(500).json({ error: "Erro ao atualizar musica na playlist" });
  }
});

export default router;
