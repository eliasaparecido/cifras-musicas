import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { songService } from '../services/songService';
import { Song } from '../types';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MINOR_KEYS = KEYS.map(k => k + 'm');
const ALL_KEYS = [...KEYS, ...MINOR_KEYS];

export default function SongDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [currentKey, setCurrentKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSong(id);
    }
  }, [id]);

  const loadSong = async (songId: string, key?: string) => {
    try {
      setLoading(true);
      const data = await songService.getById(songId, key);
      setSong(data);
      setCurrentKey(key || data.originalKey);
    } catch (error) {
      console.error('Erro ao carregar música:', error);
      alert('Erro ao carregar música');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Tem certeza que deseja excluir esta música?')) {
      try {
        await songService.delete(id);
        navigate('/songs');
      } catch (error: any) {
        console.error('Erro ao deletar música:', error);
        const message = error?.response?.data?.message || error?.response?.data?.error || 'Erro ao deletar música';
        alert(message);
      }
    }
  };

  const handleKeyChange = (newKey: string) => {
    if (id) {
      loadSong(id, newKey);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (!song) {
    return <div className="text-center py-12">Música não encontrada</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <button
            onClick={() => navigate('/songs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{song.title}</h1>
            <p className="text-gray-600 break-words">{song.artist}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/songs/${id}/edit`}
            className="btn-secondary flex items-center space-x-2 justify-center flex-1 sm:flex-initial"
          >
            <Edit size={20} />
            <span>Editar</span>
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2 justify-center flex-1 sm:flex-initial"
          >
            <Trash2 size={20} />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tom Original: <span className="font-bold">{song.originalKey}</span>
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transpor para:
            </label>
            <select
              value={currentKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="input-field max-w-xs"
            >
              {ALL_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          {currentKey !== song.originalKey && (
            <p className="text-sm text-primary-600 font-medium">
              ✓ Música transposta para {currentKey}
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg overflow-x-auto">
          <pre className="lyrics-display">
            {song.lyrics}
          </pre>
        </div>
      </div>
    </div>
  );
}
