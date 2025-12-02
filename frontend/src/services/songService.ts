import api from '../lib/api';
import { Song, CreateSongDto } from '../types';

export const songService = {
  // Listar todas as músicas
  async getAll(params?: { search?: string; artist?: string; skip?: number; take?: number }): Promise<Song[]> {
    const response = await api.get('/songs', { params });
    return response.data;
  },

  // Buscar uma música específica
  async getById(id: string, key?: string): Promise<Song> {
    const response = await api.get(`/songs/${id}`, { 
      params: { key, format: 'separated' } 
    });
    return response.data;
  },

  // Criar nova música
  async create(data: CreateSongDto): Promise<Song> {
    const response = await api.post('/songs', data);
    return response.data;
  },

  // Atualizar música
  async update(id: string, data: Partial<CreateSongDto>): Promise<Song> {
    const response = await api.put(`/songs/${id}`, data);
    return response.data;
  },

  // Deletar música
  async delete(id: string): Promise<void> {
    await api.delete(`/songs/${id}`);
  },
};
