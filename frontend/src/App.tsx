import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SongsPage from './pages/SongsPage';
import SongDetailPage from './pages/SongDetailPage';
import CreateSongPage from './pages/CreateSongPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/songs" element={<SongsPage />} />
        <Route path="/songs/new" element={<CreateSongPage />} />
        <Route path="/songs/:id" element={<SongDetailPage />} />
        <Route path="/songs/:id/edit" element={<CreateSongPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/playlists/new" element={<CreatePlaylistPage />} />
        <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
        <Route path="/playlists/:id/edit" element={<CreatePlaylistPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
