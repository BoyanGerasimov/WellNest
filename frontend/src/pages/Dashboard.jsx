import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Here's your fitness overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">Workouts</p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <span className="text-3xl">💪</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Calories</p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <span className="text-3xl">🔥</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Weight</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {user?.currentWeight ? `${user.currentWeight}` : 'N/A'}
                </p>
                {user?.currentWeight && <p className="text-blue-100 text-xs mt-1">kg</p>}
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium uppercase tracking-wide">Achievements</p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <span className="text-3xl">🏆</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Log Workout
            </span>
          </button>
          <button className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Log Meal
            </span>
          </button>
          <button className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Progress
            </span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-gray-500 font-medium">No activity yet</p>
          <p className="mt-1 text-sm text-gray-400">Start tracking your fitness journey!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

