import { Link } from 'react-router-dom';
import { Music, List, Plus } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bem-vindo ao Cifras Musicais
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gerencie suas cifras, crie playlists personalizadas e transponha tons com facilidade.
          Gere PDFs para levar suas músicas para qualquer lugar!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        {/* Card Músicas */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Music size={32} className="text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Músicas</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Cadastre e gerencie suas cifras musicais. Transponha para qualquer tom instantaneamente.
          </p>
          <div className="flex space-x-3">
            <Link to="/songs/new" className="btn-primary flex items-center space-x-2">
              <Plus size={20} />
              <span>Nova Música</span>
            </Link>
            <Link to="/songs" className="btn-secondary">
              Ver Todas
            </Link>
          </div>
        </div>

        {/* Card Playlists */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <List size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Playlists</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Organize suas músicas em playlists temáticas e gere PDFs prontos para impressão.
          </p>
          <div className="flex space-x-3">
            <Link to="/playlists/new" className="btn-primary flex items-center space-x-2">
              <Plus size={20} />
              <span>Nova Playlist</span>
            </Link>
            <Link to="/playlists" className="btn-secondary">
              Ver Todas
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-16 grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <Music size={32} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-lg mb-2">Transposição Automática</h3>
          <p className="text-gray-600">
            Mude o tom de qualquer música com um clique
          </p>
        </div>
        <div className="text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <List size={32} className="text-green-600" />
          </div>
          <h3 className="font-bold text-lg mb-2">Playlists Personalizadas</h3>
          <p className="text-gray-600">
            Organize suas músicas por tema ou evento
          </p>
        </div>
        <div className="text-center">
          <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-purple-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2">Geração de PDF</h3>
          <p className="text-gray-600">
            Exporte suas playlists em PDF para impressão
          </p>
        </div>
      </div>
    </div>
  );
}
