import { Router } from 'express';
import prisma from '../db/prisma.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createPlaylistSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
});

const duplicatePlaylistSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
});

const addSongToPlaylistSchema = z.object({
  songId: z.string().uuid('ID da música inválido'),
  key: z.string().min(1, 'Tom é obrigatório'),
  order: z.number().int().min(0),
});

// GET /api/playlists - Listar todas as playlists
router.get('/', async (req, res) => {
  try {
    const { search, skip = '0', take = '20' } = req.query;
    
    let playlists;
    
    if (search) {
      // Busca case-insensitive usando raw SQL
      const searchLower = (search as string).toLowerCase();
      const playlistIds: any[] = await prisma.$queryRaw`
        SELECT id FROM Playlist 
        WHERE LOWER(name) LIKE ${'%' + searchLower + '%'} 
           OR LOWER(description) LIKE ${'%' + searchLower + '%'}
        ORDER BY name ASC
        LIMIT ${parseInt(take as string)} 
        OFFSET ${parseInt(skip as string)}
      `;
      
      // Buscar playlists completas com relacionamentos
      if (playlistIds.length > 0) {
        playlists = await prisma.playlist.findMany({
          where: {
            id: { in: playlistIds.map((p: any) => p.id) },
          },
          include: {
            songs: {
              include: {
                song: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        });
      } else {
        playlists = [];
      }
    } else {
      playlists = await prisma.playlist.findMany({
        skip: parseInt(skip as string),
        take: parseInt(take as string),
        orderBy: { name: 'asc' },
        include: {
          songs: {
            include: {
              song: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      });
    }
    
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Erro ao buscar playlists' });
  }
});

// GET /api/playlists/:id - Buscar playlist específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: 'Erro ao buscar playlist' });
  }
});

// POST /api/playlists - Criar nova playlist
router.post('/', async (req, res) => {
  try {
    const validatedData = createPlaylistSchema.parse(req.body);
    
    const playlist = await prisma.playlist.create({
      data: validatedData,
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
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Erro ao criar playlist' });
  }
});

// PUT /api/playlists/:id - Atualizar playlist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = createPlaylistSchema.partial().parse(req.body);
    
    const playlist = await prisma.playlist.update({
      where: { id },
      data: validatedData,
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    res.json(playlist);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Erro ao atualizar playlist' });
  }
});

// DELETE /api/playlists/:id - Deletar playlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.playlist.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Erro ao deletar playlist' });
  }
});

// POST /api/playlists/:id/duplicate - Duplicar playlist
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = duplicatePlaylistSchema.parse(req.body);
    
    // Buscar playlist original com todas as músicas
    const originalPlaylist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!originalPlaylist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }
    
    // Criar nova playlist com as músicas
    const newPlaylist = await prisma.playlist.create({
      data: {
        name: validatedData.name,
        description: originalPlaylist.description,
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
          orderBy: { order: 'asc' },
        },
      },
    });
    
    res.status(201).json(newPlaylist);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Error duplicating playlist:', error);
    res.status(500).json({ error: 'Erro ao duplicar playlist' });
  }
});

// POST /api/playlists/:id/songs - Adicionar música à playlist
router.post('/:id/songs', async (req, res) => {
  try {
    const { id } = req.params;
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
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: 'Erro ao adicionar música à playlist' });
  }
});

// DELETE /api/playlists/:playlistId/songs/:songId - Remover música da playlist
router.delete('/:playlistId/songs/:songId', async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    
    await prisma.playlistSong.deleteMany({
      where: {
        playlistId,
        songId,
      },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ error: 'Erro ao remover música da playlist' });
  }
});

// PUT /api/playlists/:playlistId/songs/:songId - Atualizar música na playlist (tom ou ordem)
router.put('/:playlistId/songs/:songId', async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const { key, order } = req.body;
    
    const data: any = {};
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
    console.error('Error updating playlist song:', error);
    res.status(500).json({ error: 'Erro ao atualizar música na playlist' });
  }
});

export default router;
