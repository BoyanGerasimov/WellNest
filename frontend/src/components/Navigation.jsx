import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center group">
            <div className="h-9 w-9 bg-teal-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-md">
              <span className="text-xl font-bold text-white">W</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              WellNest
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            <Link
              to="/dashboard"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-teal-100 text-teal-700 shadow-sm'
                  : 'text-slate-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/workouts"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/workouts')
                  ? 'bg-teal-100 text-teal-700 shadow-sm'
                  : 'text-slate-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Workouts
            </Link>
            <Link
              to="/meals"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/meals')
                  ? 'bg-teal-100 text-teal-700 shadow-sm'
                  : 'text-slate-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Meals
            </Link>
            <Link
              to="/forum"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/forum')
                  ? 'bg-teal-100 text-teal-700 shadow-sm'
                  : 'text-slate-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Forum
            </Link>
            <Link
              to="/suggestions"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/suggestions')
                  ? 'bg-teal-100 text-teal-700 shadow-sm'
                  : 'text-slate-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Suggestions
            </Link>
            <Link
              to="/analytics"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/analytics')
                  ? 'bg-teal-100 text-teal-700 shadow-sm'
                  : 'text-slate-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Analytics
            </Link>
            <Link
              to="/achievements"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/achievements')
                  ? 'bg-teal-100 text-teal-700 shadow-sm'
                  : 'text-slate-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Achievements
            </Link>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              onMouseEnter={() => setProfileDropdownOpen(true)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

