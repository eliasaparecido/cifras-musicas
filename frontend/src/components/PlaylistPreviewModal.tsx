import { X, Maximize, Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Playlist } from '../types';
import { playlistService } from '../services/playlistService';

interface PlaylistPreviewModalProps {
  playlist: Playlist;
  onClose: () => void;
}

export default function PlaylistPreviewModal({ playlist, onClose }: PlaylistPreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        const blob = await playlistService.generatePDF(playlist.id);
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Erro ao carregar PDF:', error);
        alert('Erro ao carregar visualização do PDF');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();

    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [playlist.id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Erro ao alternar fullscreen:', error);
    }
  };

  const handleClose = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    onClose();
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${playlist.name || 'playlist'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div ref={containerRef} className="bg-white w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words flex-1 pr-2">{playlist.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!pdfUrl}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
              aria-label="Download"
              title="Baixar PDF"
            >
              <Download size={20} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Fullscreen"
              title="Fullscreen (F11)"
            >
              <Maximize size={20} />
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600">Carregando PDF...</div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={`PDF - ${playlist.name}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600">Erro ao carregar PDF</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
