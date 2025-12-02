import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { playlistService } from '../services/playlistService';

export default function CreatePlaylistPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadPlaylist();
    }
  }, [id, isEditing]);

  const loadPlaylist = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const playlist = await playlistService.getById(id);
      setFormData({
        name: playlist.name,
        description: playlist.description || '',
      });
    } catch (err) {
      setError('Erro ao carregar playlist');
      console.error('Erro ao carregar playlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome da playlist é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && id) {
        await playlistService.update(id, {
          name: formData.name,
          description: formData.description || undefined,
        });
        navigate(`/playlists/${id}`);
      } else {
        const playlist = await playlistService.create({
          name: formData.name,
          description: formData.description || undefined,
        });
        navigate(`/playlists/${playlist.id}`);
      }
    } catch (err) {
      setError(`Erro ao ${isEditing ? 'atualizar' : 'criar'} playlist. Tente novamente.`);
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} playlist:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {isEditing ? 'Editar Playlist' : 'Nova Playlist'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nome da Playlist *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex: Missa de Natal 2024"
              disabled={loading}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Descrição opcional da playlist..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/playlists/${id}` : '/playlists')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar Playlist')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
