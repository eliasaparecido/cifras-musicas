import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Music } from 'lucide-react';
import { songService } from '../services/songService';
import { Song } from '../types';

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadSongs(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, skip]);

  const loadSongs = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setSkip(0);
      } else {
        setLoadingMore(true);
      }
      
      const currentSkip = reset ? 0 : skip;
      const data = await songService.getAll({ 
        search: search || undefined, 
        skip: currentSkip,
        take: ITEMS_PER_PAGE 
      });
      
      if (reset) {
        setSongs(data);
      } else {
        setSongs(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
      if (!reset) {
        setSkip(currentSkip + ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadSongs(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSongs(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta música?')) {
      try {
        await songService.delete(id);
        loadSongs(true);
      } catch (error: any) {
        console.error('Erro ao deletar música:', error);
        const message = error?.response?.data?.message || error?.response?.data?.error || 'Erro ao deletar música';
        alert(message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Músicas</h1>
        <Link to="/songs/new" className="btn-primary flex items-center justify-center space-x-2">
          <Plus size={20} />
          <span>Nova Música</span>
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título ou artista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary px-4 sm:px-6">
          Buscar
        </button>
      </form>

      {/* Songs List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Carregando...</p>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-12">
          <Music size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Nenhuma música cadastrada ainda</p>
          <Link to="/songs/new" className="btn-primary inline-flex items-center space-x-2">
            <Plus size={20} />
            <span>Cadastrar Primeira Música</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {songs.map((song) => (
            <div key={song.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/songs/${song.id}`}
                    className="text-lg sm:text-xl font-bold text-gray-900 hover:text-primary-600 break-words"
                  >
                    {song.title}
                  </Link>
                  <p className="text-gray-600 break-words">{song.artist}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Tom: <span className="font-semibold">{song.originalKey}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/songs/${song.id}/edit`}
                    className="px-3 sm:px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-1 sm:flex-initial text-center"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="px-3 sm:px-4 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors flex-1 sm:flex-initial"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Scroll Trigger */}
          <div ref={observerTarget} className="py-4 text-center">
            {loadingMore && <p className="text-gray-600">Carregando mais...</p>}
            {!hasMore && songs.length > 0 && <p className="text-gray-400">Fim da lista</p>}
          </div>
        </div>
      )}
    </div>
  );
}
