# 📚 Documentação da API

## Base URL
```
http://localhost:3002/api
```

## Endpoints

### 🎵 Songs (Músicas)

#### Listar todas as músicas
```http
GET /songs
Query params:
  - search: string (opcional) - Busca por título ou artista
  - artist: string (opcional) - Filtra por artista

Response: Song[]
```
```
http://localhost:3002/api
```http
GET /songs/:id
Query params:
  - key: string (opcional) - Tom para transposição

Response: Song
```

#### Criar nova música
```http
POST /songs
Body: {
  "title": "Amazing Grace",
  "artist": "John Newton",
  "originalKey": "G",
  "lyrics": "[G]Amazing [C]grace, how [G]sweet the sound..."
}

Response: Song
```

#### Atualizar música
```http
PUT /songs/:id
Body: Partial<Song>

Response: Song
```

#### Deletar música
```http
DELETE /songs/:id

Response: 204 No Content
```

---

### 📋 Playlists

#### Listar todas as playlists
```http
GET /playlists

Response: Playlist[] (inclui músicas)
```

#### Buscar playlist por ID
```http
GET /playlists/:id

```

#### Criar nova playlist
```http
POST /playlists
Body: {
  "name": "Missa Domingo - 15/12",
  "description": "Músicas para a missa de domingo"
}

Response: Playlist
```

#### Atualizar playlist
```http
PUT /playlists/:id
Body: {
  "name": "Novo nome",
  "description": "Nova descrição"
}

Response: Playlist
```

#### Deletar playlist
```http
DELETE /playlists/:id

Response: 204 No Content
```

#### Adicionar música à playlist
```http
POST /playlists/:id/songs
Body: {
  "songId": "uuid-da-musica",
  "key": "C",  // Tom para esta música na playlist
  "order": 0   // Posição na playlist
}

Response: PlaylistSong
```

#### Remover música da playlist
```http
DELETE /playlists/:playlistId/songs/:songId

Response: 204 No Content
```

#### Atualizar música na playlist
```http
PUT /playlists/:playlistId/songs/:songId
Body: {
  "key": "D",    // Novo tom (opcional)
  "order": 2     // Nova ordem (opcional)
}

Response: PlaylistSong
```

---

### 📄 PDF

#### Gerar PDF de uma playlist
```http
POST /pdf/generate
Body: {
  "playlistId": "uuid-da-playlist"
}

Response: application/pdf (arquivo binário)
```

---
## Modelos de Dados

### Song
```typescript
{
  id: string;           // UUID
  title: string;        // Título da música
  artist: string;       // Nome do artista
  originalKey: string;  // Tom original (ex: "C", "Am", "G#")
  lyrics: string;       // Letra com cifras [acorde]texto
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}

### Playlist
```typescript
{
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  songs: PlaylistSong[];  // Músicas na playlist
}
```

### PlaylistSong
```typescript
{
  id: string;
  playlistId: string;
  songId: string;
  order: number;        // Ordem na playlist
  key: string;          // Tom específico para esta playlist
  song: Song;           // Dados completos da música
}
```

---

## Exemplos de Uso

### Criar e popular uma playlist completa

```javascript
await fetch(`http://localhost:3002/api/playlists/${playlist.id}/songs`, {
const song1 = await fetch('http://localhost:3002/api/songs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Amazing Grace",
    artist: "John Newton",
    originalKey: "G",
    lyrics: `[G]Amazing [C]grace, how [G]sweet the [D]sound
[G]That saved a [C]wretch like [G]me
[G]I once was [C]lost, but [G]now am [D]found
const pdfResponse = await fetch('http://localhost:3002/api/pdf/generate', {
  })
});

// 2. Criar playlist
const playlist = await fetch('http://localhost:3002/api/playlists', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Missa de Natal 2024",
    description: "Músicas para a celebração de Natal"
  })
});

const transposed = await fetch(
  'http://localhost:3002/api/songs/[song-id]?key=C'
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    songId: song1.id,
    key: "C",  // Transpõe de G para C
  })
});

// 4. Gerar PDF
const pdfResponse = await fetch('http://localhost:3002/api/pdf/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ playlistId: playlist.id })
});

const blob = await pdfResponse.blob();
// Fazer download do PDF
```

### Transpor uma música
  'http://localhost:3002/api/songs/[song-id]?key=C'

// A resposta conterá a letra com todos os acordes transpostos
```

---

## Formato de Cifras

As cifras devem estar entre colchetes na letra:

```
[C]Verso com [Am]cifras entre [F]colchetes [G]aqui
[Dm]Outro verso [G]com acordes [C]menores

Refrão:
[F]Pode ter [G]qualquer acorde [C]suportado
[Am]Menores, [F]maiores, [G7]com sétima [C]etc
```

Acordes suportados:
- Maiores: C, D, E, F, G, A, B (com # ou b)
- Menores: Cm, Dm, Em, etc (adicione 'm')
- Com sétima: C7, Dm7, Gmaj7, etc
- Outros: Csus4, Caug, Cdim, etc

---

## Health Check

```http
GET /health

Response: {
  "status": "ok",
  "timestamp": "2024-12-02T10:00:00.000Z"
}
```
