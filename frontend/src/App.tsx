import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import HomePage from './pages/HomePage';
import SongsPage from './pages/SongsPage';
import SongDetailPage from './pages/SongDetailPage';
import CreateSongPage from './pages/CreateSongPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/change-password" element={<RequireAuth><ChangePasswordPage /></RequireAuth>} />
        <Route path="/songs" element={<SongsPage />} />
        <Route path="/songs/new" element={<RequireAuth><CreateSongPage /></RequireAuth>} />
        <Route path="/songs/:id" element={<SongDetailPage />} />
        <Route path="/songs/:id/edit" element={<RequireAuth><CreateSongPage /></RequireAuth>} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/playlists/new" element={<RequireAuth><CreatePlaylistPage /></RequireAuth>} />
        <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
        <Route path="/playlists/:id/edit" element={<RequireAuth><CreatePlaylistPage /></RequireAuth>} />
      </Routes>
    </Layout>
  );
}

export default App;
