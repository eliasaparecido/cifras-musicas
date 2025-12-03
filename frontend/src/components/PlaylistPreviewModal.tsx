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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words flex-1 pr-2">{playlist.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="space-y-4 sm:space-y-6">
            {playlist.songs
              .sort((a, b) => a.order - b.order)
              .map((playlistSong, index) => {
                const lyrics = convertToChordOverLyrics(
                  playlistSong.song.lyrics,
                  playlistSong.key,
                  playlistSong.song.originalKey
                );

                return (
                  <div key={playlistSong.id} className="border-b pb-4 sm:pb-6 last:border-b-0">
                    {/* Song Header */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl font-bold text-gray-400 flex-shrink-0">{index + 1}.</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
                            {playlistSong.song.title}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 break-words">
                            {playlistSong.song.artist} • Tom: {playlistSong.key}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Song Lyrics */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 overflow-x-auto">
                      <pre className="lyrics-display">
                        {lyrics}
                      </pre>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
