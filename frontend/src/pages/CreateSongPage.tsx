import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { songService } from '../services/songService';
import { CreateSongDto } from '../types';
import api from '../lib/api';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MINOR_KEYS = KEYS.map(k => k + 'm');
const ALL_KEYS = [...KEYS, ...MINOR_KEYS];

export default function CreateSongPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CreateSongDto>({
    title: '',
    artist: '',
    originalKey: 'C',
    lyrics: '',
  });

  useEffect(() => {
    if (id) {
      loadSong();
    }
  }, [id]);

  const loadSong = async () => {
    if (!id) return;
    try {
      const song = await songService.getById(id);
      setFormData({
        title: song.title,
        artist: song.artist,
        originalKey: song.originalKey,
        lyrics: song.lyrics,
      });
    } catch (error) {
      console.error('Erro ao carregar música:', error);
      alert('Erro ao carregar música');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artist || !formData.lyrics) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await songService.update(id, formData);
      } else {
        await songService.create(formData);
      }
      navigate('/songs');
    } catch (error) {
      console.error('Erro ao salvar música:', error);
      alert('Erro ao salvar música');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await api.post('/ocr/extract', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.text) {
        setFormData(prev => ({
          ...prev,
          lyrics: response.data.text,
        }));
        alert('Texto extraído com sucesso! Revise e edite se necessário.');
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar imagem. Tente novamente ou digite manualmente.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/songs')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Editar Música' : 'Nova Música'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artista *
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tom Original *
          </label>
          <select
            value={formData.originalKey}
            onChange={(e) => setFormData({ ...formData, originalKey: e.target.value })}
            className="input-field"
            required
          >
            {ALL_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Letra com Cifras *
            </label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <Upload size={16} />
                {uploadingImage ? 'Processando...' : 'Upload de Imagem'}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Você pode digitar ou fazer upload de uma imagem com a cifra.
          </p>
          <div className="bg-gray-50 p-3 rounded mb-2 text-xs">
            <p className="font-semibold mb-1">Formato 1 - Inline (acordes no meio do texto):</p>
            <code className="text-gray-700">[C]Exemplo de [G]letra com [Am]cifras [F]aqui...</code>
            
            <p className="font-semibold mt-3 mb-1">Formato 2 - Linhas separadas (mais fácil de copiar):</p>
            <code className="text-gray-700">
              C&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Am<br/>
              Senhor meu Deus, quando eu maravilhado
            </code>
          </div>
          <textarea
            value={formData.lyrics}
            onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
            className="input-field font-mono"
            rows={20}
            placeholder="Cole sua música aqui em qualquer um dos formatos acima..."
            required
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/songs')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={20} />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
