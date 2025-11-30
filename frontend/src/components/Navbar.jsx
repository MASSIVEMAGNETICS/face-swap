/**
 * Navbar Component
 * Main navigation header
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, FolderKanban } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">FS</span>
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                Face Swap Studio
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/studio"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Studio
                </Link>
                <Link
                  to="/projects"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Projects
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="hidden lg:block">{user?.name || user?.email}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <Link
                        to="/projects"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FolderKanban className="w-4 h-4 mr-2" />
                        My Projects
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/studio"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Studio
                </Link>
                <Link
                  to="/projects"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Projects
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
