import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';

interface DuplicatePlaylistModalProps {
  playlistName: string;
  onConfirm: (newName: string) => void;
  onClose: () => void;
}

export default function DuplicatePlaylistModal({
  playlistName,
  onConfirm,
  onClose,
}: DuplicatePlaylistModalProps) {
  const [newName, setNewName] = useState(`${playlistName} (cópia)`);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onConfirm(newName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Duplicar Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da nova playlist
            </label>
            <input
              type="text"
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
              placeholder="Digite o nome da nova playlist"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
            >
              Duplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
