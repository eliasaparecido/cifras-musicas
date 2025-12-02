import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import { songService } from '../services/songService';
import { Playlist, Song, PlaylistSong } from '../types';
import PlaylistPreviewModal from '../components/PlaylistPreviewModal';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MINOR_KEYS = KEYS.map(k => k + 'm');
const ALL_KEYS = [...KEYS, ...MINOR_KEYS];

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [songKey, setSongKey] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      const [playlistData, songsData] = await Promise.all([
        playlistService.getById(id),
        songService.getAll(),
      ]);
      setPlaylist(playlistData);
      setAvailableSongs(songsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async () => {
    if (!id || !selectedSongId || !songKey) return;

    try {
      const order = playlist?.songs.length || 0;
      await playlistService.addSong(id, {
        songId: selectedSongId,
        key: songKey,
        order,
      });
      await loadData();
      setShowAddSong(false);
      setSelectedSongId('');
      setSongKey('');
    } catch (error) {
      console.error('Erro ao adicionar música:', error);
      alert('Erro ao adicionar música');
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!id || !confirm('Remover esta música da playlist?')) return;

    try {
      await playlistService.removeSong(id, songId);
      await loadData();
    } catch (error) {
      console.error('Erro ao remover música:', error);
      alert('Erro ao remover música');
    }
  };

  const handleUpdateKey = async (songId: string, newKey: string) => {
    if (!id || !newKey) return;

    try {
      await playlistService.updateSong(id, songId, { key: newKey });
      await loadData();
      setEditingKey(null);
      setTempKey('');
    } catch (error) {
      console.error('Erro ao atualizar tom:', error);
      alert('Erro ao atualizar tom');
    }
  };

  const handleGeneratePDF = async () => {
    if (!id) return;

    setGeneratingPDF(true);
    try {
      const blob = await playlistService.generatePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playlist?.name || 'playlist'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id || !confirm('Deseja realmente excluir esta playlist?')) return;

    try {
      await playlistService.delete(id);
      navigate('/playlists');
    } catch (error) {
      console.error('Erro ao excluir playlist:', error);
      alert('Erro ao excluir playlist');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex || !id || !playlist) return;

    const sortedSongs = [...playlist.songs].sort((a, b) => a.order - b.order);
    const draggedSong = sortedSongs[draggedIndex];
    
    // Remove da posição antiga
    sortedSongs.splice(draggedIndex, 1);
    // Insere na nova posição
    sortedSongs.splice(dropIndex, 0, draggedSong);

    // Atualiza a ordem de todas as músicas afetadas
    try {
      for (let i = 0; i < sortedSongs.length; i++) {
        if (sortedSongs[i].order !== i) {
          await playlistService.updateSong(id, sortedSongs[i].songId, { order: i });
        }
      }
      await loadData();
    } catch (error) {
      console.error('Erro ao reordenar músicas:', error);
      alert('Erro ao reordenar músicas');
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Carregando...</div>;
  }

  if (!playlist) {
    return <div className="container mx-auto px-4 py-8">Playlist não encontrada</div>;
  }

  const songsInPlaylist = playlist.songs.map(ps => ps.songId);
  const availableToAdd = availableSongs.filter(s => !songsInPlaylist.includes(s.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/playlists" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Voltar para Playlists
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-gray-600 mb-4">{playlist.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              disabled={playlist.songs.length === 0}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              👁️ Visualizar
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF || playlist.songs.length === 0}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {generatingPDF ? 'Gerando...' : '📄 Gerar PDF'}
            </button>
            <button
              onClick={handleDeletePlaylist}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Músicas ({playlist.songs.length})</h2>
          <button
            onClick={() => setShowAddSong(!showAddSong)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {showAddSong ? 'Cancelar' : '+ Adicionar Música'}
          </button>
        </div>

        {showAddSong && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesquisar Música
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite para pesquisar..."
                  className="w-full border rounded px-3 py-2 mb-2"
                />
                <div className="border rounded max-h-64 overflow-y-auto bg-white">
                  {availableToAdd
                    .filter(song => {
                      if (!searchQuery) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        song.title.toLowerCase().includes(query) ||
                        song.artist.toLowerCase().includes(query)
                      );
                    })
                    .map((song) => (
                      <div
                        key={song.id}
                        onClick={() => {
                          setSelectedSongId(song.id);
                          setSongKey(song.originalKey);
                        }}
                        className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                          selectedSongId === song.id ? 'bg-blue-100 font-semibold' : ''
                        }`}
                      >
                        {song.title} - {song.artist}
                      </div>
                    ))}
                  {availableToAdd.filter(song => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      song.title.toLowerCase().includes(query) ||
                      song.artist.toLowerCase().includes(query)
                    );
                  }).length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-center">
                      Nenhuma música encontrada
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tom
                  </label>
                  <select
                    value={songKey}
                    onChange={(e) => setSongKey(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Selecione o tom</option>
                    {ALL_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddSong}
                    disabled={!selectedSongId || !songKey}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {playlist.songs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma música adicionada ainda. Clique em "Adicionar Música" para começar.
          </p>
        ) : (
          <div className="space-y-2">
            {playlist.songs
              .sort((a, b) => a.order - b.order)
              .map((playlistSong, index) => (
                <div
                  key={playlistSong.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-4 bg-gray-50 rounded hover:bg-gray-100 cursor-move transition-all ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                      ⋮⋮
                    </span>
                    <span className="text-gray-500 font-bold">{index + 1}</span>
                    <div>
                      <Link
                        to={`/songs/${playlistSong.songId}`}
                        className="font-semibold hover:text-blue-500"
                      >
                        {playlistSong.song.title}
                      </Link>
                      <p className="text-sm text-gray-600">{playlistSong.song.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {editingKey === playlistSong.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={tempKey}
                          onChange={(e) => setTempKey(e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                          autoFocus
                        >
                          {ALL_KEYS.map((key) => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateKey(playlistSong.songId, tempKey)}
                          className="text-green-600 hover:text-green-700 font-bold text-xl"
                          title="Salvar"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingKey(null);
                            setTempKey('');
                          }}
                          className="text-gray-500 hover:text-gray-700 font-bold"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingKey(playlistSong.id);
                          setTempKey(playlistSong.key);
                        }}
                        className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                        title="Clique para editar o tom"
                      >
                        Tom: {playlistSong.key} ✏️
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveSong(playlistSong.songId)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização */}
      {showPreview && playlist && (
        <PlaylistPreviewModal
          playlist={playlist}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
