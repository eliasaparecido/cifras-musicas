import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Music, List, Home, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { authService } from '../services/authService';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [userName, setUserName] = useState(authService.getCurrentUser()?.name || '');

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
      setUserName(authService.getCurrentUser()?.name || '');
    };

    window.addEventListener('auth-changed', syncAuth);
    return () => window.removeEventListener('auth-changed', syncAuth);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <Music size={28} className="md:w-8 md:h-8" />
              <h1 className="text-xl md:text-2xl font-bold">Cifras Musicais</h1>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-primary-600'
                    : 'hover:bg-primary-600'
                }`}
              >
                <Home size={20} />
                <span>Início</span>
              </Link>
              <Link
                to="/songs"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/songs')
                    ? 'bg-primary-600'
                    : 'hover:bg-primary-600'
                }`}
              >
                <Music size={20} />
                <span>Músicas</span>
              </Link>
              <Link
                to="/playlists"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/playlists')
                    ? 'bg-primary-600'
                    : 'hover:bg-primary-600'
                }`}
              >
                <List size={20} />
                <span>Playlists</span>
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-1 px-3 py-2 bg-primary-600 rounded-lg text-sm">
                    <User size={16} />
                    <span>{userName || 'Usuario'}</span>
                  </div>
                  <Link
                    to="/change-password"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary-600"
                  >
                    <User size={16} />
                    <span>Senha</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary-600"
                  >
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary-600">
                  <LogIn size={16} />
                  <span>Entrar</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-primary-600 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-2 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-primary-600'
                    : 'hover:bg-primary-600'
                }`}
              >
                <Home size={20} />
                <span>Início</span>
              </Link>
              <Link
                to="/songs"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/songs')
                    ? 'bg-primary-600'
                    : 'hover:bg-primary-600'
                }`}
              >
                <Music size={20} />
                <span>Músicas</span>
              </Link>
              <Link
                to="/playlists"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/playlists')
                    ? 'bg-primary-600'
                    : 'hover:bg-primary-600'
                }`}
              >
                <List size={20} />
                <span>Playlists</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/change-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-primary-600"
                  >
                    <User size={20} />
                    <span>Alterar senha</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-primary-600"
                  >
                    <LogOut size={20} />
                    <span>Sair ({userName || 'Usuario'})</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-primary-600"
                >
                  <LogIn size={20} />
                  <span>Entrar</span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 Cifras Musicais - Sistema de Gerenciamento de Cifras
          </p>
        </div>
      </footer>
    </div>
  );
}
