import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center group">
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                <span className="text-lg font-bold text-white">W</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                WellNest
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/workouts"
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Workouts
              </Link>
              <Link
                to="/meals"
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Meals
              </Link>
              <Link
                to="/forum"
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Forum
              </Link>
              <Link
                to="/achievements"
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Achievements
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <span className="text-gray-700 font-medium">{user?.name?.split(' ')[0] || user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

