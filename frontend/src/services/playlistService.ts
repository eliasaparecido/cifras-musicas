import api from "../lib/api";
import { Playlist, CreatePlaylistDto, AddSongToPlaylistDto } from "../types";

export const playlistService = {
  // Listar todas as playlists
  async getAll(params?: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<Playlist[]> {
    const response = await api.get("/playlists", { params });
    return response.data;
  },

  // Buscar playlist específica
  async getById(id: string): Promise<Playlist> {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  // Criar nova playlist
  async create(data: CreatePlaylistDto): Promise<Playlist> {
    const response = await api.post("/playlists", data);
    return response.data;
  },

  // Atualizar playlist
  async update(
    id: string,
    data: Partial<CreatePlaylistDto>
  ): Promise<Playlist> {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data;
  },

  // Deletar playlist
  async delete(id: string): Promise<void> {
    await api.delete(`/playlists/${id}`);
  },

  // Duplicar playlist
  async duplicate(id: string, name: string): Promise<Playlist> {
    const response = await api.post(`/playlists/${id}/duplicate`, { name });
    return response.data;
  },

  // Adicionar música à playlist
  async addSong(playlistId: string, data: AddSongToPlaylistDto): Promise<void> {
    await api.post(`/playlists/${playlistId}/songs`, data);
  },

  // Remover música da playlist
  async removeSong(playlistId: string, songId: string): Promise<void> {
    await api.delete(`/playlists/${playlistId}/songs/${songId}`);
  },

  // Atualizar música na playlist
  async updateSong(
    playlistId: string,
    songId: string,
    data: { key?: string; order?: number }
  ): Promise<void> {
    await api.put(`/playlists/${playlistId}/songs/${songId}`, data);
  },

  // Gerar PDF da playlist
  async generatePDF(
    playlistId: string,
    showChords: boolean = true
  ): Promise<Blob> {
    const response = await api.post(
      "/pdf/generate",
      { playlistId, showChords },
      { responseType: "blob" }
    );
    return response.data;
  },
};
