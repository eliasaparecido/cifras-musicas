export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  lyrics: string;
  isPublic: boolean;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
  songs: PlaylistSong[];
}

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  order: number;
  key: string;
  song: Song;
}

export interface CreateSongDto {
  title: string;
  artist: string;
  originalKey: string;
  lyrics: string;
  isPublic?: boolean;
}

export interface CreatePlaylistDto {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddSongToPlaylistDto {
  songId: string;
  key: string;
  order: number;
}
