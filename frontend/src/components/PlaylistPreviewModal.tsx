import { X, Maximize, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Playlist } from "../types";
import { playlistService } from "../services/playlistService";

interface PlaylistPreviewModalProps {
  playlist: Playlist;
  onClose: () => void;
}

export default function PlaylistPreviewModal({
  playlist,
  onClose,
}: PlaylistPreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showChords, setShowChords] = useState(true);

  useEffect(() => {
    // Detectar dispositivo móvel
    const checkMobile = () => {
      setIsMobile(
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
          window.innerWidth < 768
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        // Limpar URL anterior se existir
        if (pdfUrl) {
          window.URL.revokeObjectURL(pdfUrl);
          setPdfUrl(null);
        }
        const blob = await playlistService.generatePDF(playlist.id, showChords);
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Erro ao carregar PDF:", error);
        alert("Erro ao carregar visualização do PDF");
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
  }, [playlist.id, showChords]);


  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Erro ao alternar fullscreen:", error);
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

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${playlist.name || "playlist"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenPDF = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        ref={containerRef}
        className="bg-white w-full h-full overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border-b bg-white gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words flex-1 pr-2">
            {playlist.name}
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle para mostrar/ocultar cifras */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showChords}
                  onChange={(e) => setShowChords(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Mostrar cifras
                </span>
              </label>
            </div>

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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600">Carregando PDF...</div>
            </div>
          ) : pdfUrl ? (
            isMobile ? (
              // Em mobile, mostrar botão para abrir em nova aba
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <p className="text-gray-700 mb-6">
                  Para visualizar o PDF no celular, clique no botão abaixo para
                  abrir em uma nova aba:
                </p>
                <button
                  onClick={handleOpenPDF}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-lg mb-4"
                >
                  Abrir PDF
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-500 hover:bg-green-700 text-white font-bold rounded-lg"
                >
                  Baixar PDF
                </button>
              </div>
            ) : (
              // Em desktop, mostrar iframe
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={`PDF - ${playlist.name}`}
              />
            )
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
