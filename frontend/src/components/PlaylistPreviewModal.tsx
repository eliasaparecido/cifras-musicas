import { X } from 'lucide-react';
import { Playlist } from '../types';
import { transposeChord } from '../utils/transposeUtils';

interface PlaylistPreviewModalProps {
  playlist: Playlist;
  onClose: () => void;
}

export default function PlaylistPreviewModal({ playlist, onClose }: PlaylistPreviewModalProps) {
  const convertToChordOverLyrics = (lyrics: string, transposeTo?: string, originalKey?: string) => {
    let processedLyrics = lyrics;

    // Se precisar transpor
    if (transposeTo && originalKey && transposeTo !== originalKey) {
      const regex = /\[([^\]]+)\]/g;
      processedLyrics = processedLyrics.replace(regex, (match, chord) => {
        const transposed = transposeChord(chord, originalKey, transposeTo);
        return `[${transposed}]`;
      });
    }

    // Converter formato inline [C]texto para formato linhas separadas
    const lines = processedLyrics.split('\n');
    const result: string[] = [];

    for (const line of lines) {
      if (!line.includes('[')) {
        result.push(line);
        continue;
      }

      let chordLine = '';
      let lyricLine = '';
      let currentPos = 0;

      const regex = /\[([^\]]+)\]/g;
      let match;

      while ((match = regex.exec(line)) !== null) {
        const chord = match[1];
        const chordPos = match.index;
        
        // Adicionar espaços até a posição do acorde
        while (currentPos < chordPos) {
          chordLine += ' ';
          currentPos++;
        }
        
        // Adicionar o acorde
        chordLine += chord;
        currentPos = chordPos + match[0].length;
      }

      // Remover os acordes da linha de letra
      lyricLine = line.replace(/\[([^\]]+)\]/g, '');

      // Adicionar linhas ao resultado
      if (chordLine.trim()) {
        result.push(chordLine);
      }
      result.push(lyricLine);
    }

    return result.join('\n');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{playlist.name}</h2>
            {playlist.description && (
              <p className="text-gray-600 mt-1">{playlist.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {playlist.songs
              .sort((a, b) => a.order - b.order)
              .map((playlistSong, index) => {
                const lyrics = convertToChordOverLyrics(
                  playlistSong.song.lyrics,
                  playlistSong.key,
                  playlistSong.song.originalKey
                );

                return (
                  <div key={playlistSong.id} className="border-b pb-8 last:border-b-0">
                    {/* Song Header */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-gray-400">{index + 1}.</span>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {playlistSong.song.title}
                          </h3>
                          <p className="text-gray-600">
                            {playlistSong.song.artist} • Tom: {playlistSong.key}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Song Lyrics */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <pre className="font-mono text-sm whitespace-pre-wrap">
                        {lyrics}
                      </pre>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
