export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  lyrics: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
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
}

export interface CreatePlaylistDto {
  name: string;
  description?: string;
}

export interface AddSongToPlaylistDto {
  songId: string;
  key: string;
  order: number;
}
