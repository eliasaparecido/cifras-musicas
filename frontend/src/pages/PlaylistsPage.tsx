import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, List as ListIcon, FileDown, Search, Eye, Copy } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import { Playlist } from '../types';
import PlaylistPreviewModal from '../components/PlaylistPreviewModal';
import DuplicatePlaylistModal from '../components/DuplicatePlaylistModal';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [previewPlaylist, setPreviewPlaylist] = useState<Playlist | null>(null);
  const [duplicatePlaylist, setDuplicatePlaylist] = useState<Playlist | null>(null);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadPlaylists(true);
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

  const loadPlaylists = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setSkip(0);
      } else {
        setLoadingMore(true);
      }
      
      const currentSkip = reset ? 0 : skip;
      const data = await playlistService.getAll({ 
        search: search || undefined,
        skip: currentSkip,
        take: ITEMS_PER_PAGE 
      });
      
      if (reset) {
        setPlaylists(data);
      } else {
        setPlaylists(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
      if (!reset) {
        setSkip(currentSkip + ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Erro ao carregar playlists:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPlaylists(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlaylists(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta playlist?')) {
      try {
        await playlistService.delete(id);
        loadPlaylists();
      } catch (error) {
        console.error('Erro ao deletar playlist:', error);
        alert('Erro ao deletar playlist');
      }
    }
  };

  const handleGeneratePDF = async (playlist: Playlist) => {
    try {
      setGeneratingPDF(playlist.id);
      const pdfBlob = await playlistService.generatePDF(playlist.id);
      
      // Criar link para download
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playlist.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setGeneratingPDF(null);
    }
  };

  const handleDuplicate = async (newName: string) => {
    if (!duplicatePlaylist) return;

    try {
      await playlistService.duplicate(duplicatePlaylist.id, newName);
      setDuplicatePlaylist(null);
      loadPlaylists(true);
    } catch (error) {
      console.error('Erro ao duplicar playlist:', error);
      alert('Erro ao duplicar playlist');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Playlists</h1>
        <Link to="/playlists/new" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nova Playlist</span>
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar playlist por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button type="submit" className="btn-primary">
          Buscar
        </button>
      </form>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Carregando...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12">
          <ListIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Nenhuma playlist criada ainda</p>
          <Link to="/playlists/new" className="btn-primary inline-flex items-center space-x-2">
            <Plus size={20} />
            <span>Criar Primeira Playlist</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/playlists/${playlist.id}`}
                    className="text-lg sm:text-xl font-bold text-gray-900 hover:text-primary-600 break-words"
                  >
                    {playlist.name}
                  </Link>
                  {playlist.description && (
                    <p className="text-gray-600 mt-1 break-words">{playlist.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {playlist.songs.length} {playlist.songs.length === 1 ? 'música' : 'músicas'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPreviewPlaylist(playlist)}
                    disabled={playlist.songs.length === 0}
                    className="px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2"
                  >
                    <Eye size={16} className="flex-shrink-0" />
                    <span className="hidden sm:inline">Visualizar</span>
                    <span className="sm:hidden">Ver</span>
                  </button>
                  <button
                    onClick={() => setDuplicatePlaylist(playlist)}
                    className="px-3 py-2 text-xs sm:text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
                  >
                    <Copy size={16} className="flex-shrink-0" />
                    <span className="hidden sm:inline">Duplicar</span>
                    <span className="sm:hidden">Dup</span>
                  </button>
                  <button
                    onClick={() => handleGeneratePDF(playlist)}
                    disabled={generatingPDF === playlist.id || playlist.songs.length === 0}
                    className="px-3 py-2 text-xs sm:text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2"
                  >
                    <FileDown size={16} className="flex-shrink-0" />
                    <span>
                      {generatingPDF === playlist.id ? 'Gerando...' : 'PDF'}
                    </span>
                  </button>
                  <Link
                    to={`/playlists/${playlist.id}/edit`}
                    className="px-3 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors inline-flex items-center"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(playlist.id)}
                    className="px-3 py-2 text-xs sm:text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
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
            {!hasMore && playlists.length > 0 && <p className="text-gray-400">Fim da lista</p>}
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {previewPlaylist && (
        <PlaylistPreviewModal
          playlist={previewPlaylist}
          onClose={() => setPreviewPlaylist(null)}
        />
      )}

      {/* Modal de Duplicação */}
      {duplicatePlaylist && (
        <DuplicatePlaylistModal
          playlistName={duplicatePlaylist.name}
          onConfirm={handleDuplicate}
          onClose={() => setDuplicatePlaylist(null)}
        />
      )}
    </div>
  );
}
