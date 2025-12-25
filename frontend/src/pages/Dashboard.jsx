import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workoutService } from '../services/workoutService';
import { mealService } from '../services/mealService';
import { healthScoreService } from '../services/healthScoreService';
import { achievementService } from '../services/achievementService';
import { suggestionService } from '../services/suggestionService';
import CalorieChart from '../components/charts/CalorieChart';
import WorkoutFrequencyChart from '../components/charts/WorkoutFrequencyChart';
import WeightChart from '../components/charts/WeightChart';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [mealStats, setMealStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [recentMeals, setRecentMeals] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [achievementStats, setAchievementStats] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get stats for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const [
        workoutStatsRes,
        mealStatsRes,
        workoutsRes,
        mealsRes,
        healthScoreRes,
        achievementStatsRes,
        suggestionsRes
      ] = await Promise.all([
        workoutService.getWorkoutStats({ startDate }),
        mealService.getMealStats({ startDate }),
        workoutService.getWorkouts({ limit: 5 }),
        mealService.getMeals({ limit: 5 }),
        healthScoreService.getHealthScore().catch(() => null),
        achievementService.getAchievementStats().catch(() => null),
        suggestionService.getAllSuggestions().catch(() => null)
      ]);

      setWorkoutStats(workoutStatsRes.data);
      setMealStats(mealStatsRes.data);
      setRecentWorkouts(workoutsRes.data || []);
      setRecentMeals(mealsRes.data || []);
      setHealthScore(healthScoreRes?.data || null);
      setAchievementStats(achievementStatsRes?.data || null);
      setSuggestions(suggestionsRes?.data || null);

      // Check for new achievements
      try {
        await achievementService.checkAchievements();
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalCaloriesBurned = workoutStats?.totalCaloriesBurned || 0;
  const totalCaloriesIntake = mealStats?.totalCalories || 0;
  const netCalories = totalCaloriesIntake - totalCaloriesBurned;
  const totalWorkouts = workoutStats?.totalWorkouts || 0;

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

      {/* Health Score & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Health Score */}
        {healthScore && (
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden shadow-lg rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Health Score</h2>
                <span className="text-3xl">{healthScore.grade}</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-100 text-sm">Overall Score</span>
                  <span className="text-2xl font-bold text-white">
                    {healthScore.totalScore}/{healthScore.maxScore}
                  </span>
                </div>
                <div className="w-full bg-purple-400/30 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{ width: `${healthScore.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(healthScore.factors).slice(0, 4).map(([key, factor]) => (
                  <div key={key} className="bg-white/20 rounded p-2">
                    <p className="text-purple-100 text-xs">{factor.label}</p>
                    <p className="text-white font-semibold">{factor.score}/{factor.maxScore}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievementStats && (
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{achievementStats.totalAchievements}</p>
                <p className="text-sm text-gray-500">Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{achievementStats.totalPoints}</p>
                <p className="text-sm text-gray-500">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{achievementStats.currentStreak}</p>
                <p className="text-sm text-gray-500">Day Streak</p>
              </div>
            </div>
            {achievementStats.achievements && achievementStats.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {achievementStats.achievements.slice(0, 5).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                    title={achievement.description}
                  >
                    <span className="text-xl">{achievement.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{achievement.title}</span>
                  </div>
                ))}
                {achievementStats.achievements.length > 5 && (
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-500">
                      +{achievementStats.achievements.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.all && suggestions.all.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Suggestions for You</h2>
          <div className="space-y-3">
            {suggestions.all.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  suggestion.priority === 'high'
                    ? 'bg-red-50 border-red-500'
                    : suggestion.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{suggestion.icon}</span>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{suggestion.message}</p>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-1 rounded ${
                        suggestion.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : suggestion.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {suggestion.priority} priority
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">Workouts</p>
                <p className="mt-2 text-3xl font-bold text-white">{totalWorkouts}</p>
                <p className="mt-1 text-indigo-100 text-xs">Last 30 days</p>
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
                <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Calories Intake</p>
                <p className="mt-2 text-3xl font-bold text-white">{Math.round(totalCaloriesIntake)}</p>
                <p className="mt-1 text-green-100 text-xs">Last 30 days</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <span className="text-3xl">🍎</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium uppercase tracking-wide">Calories Burned</p>
                <p className="mt-2 text-3xl font-bold text-white">{Math.round(totalCaloriesBurned)}</p>
                <p className="mt-1 text-red-100 text-xs">Last 30 days</p>
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
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Net Calories</p>
                <p className={`mt-2 text-3xl font-bold ${netCalories >= 0 ? 'text-white' : 'text-yellow-200'}`}>
                  {netCalories >= 0 ? '+' : ''}{Math.round(netCalories)}
                </p>
                <p className="mt-1 text-blue-100 text-xs">Intake - Burned</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CalorieChart mealStats={mealStats} workoutStats={workoutStats} />
        <WorkoutFrequencyChart workouts={workoutStats?.workouts || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WeightChart user={user} />
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Workout Time</span>
              <span className="font-semibold text-gray-900">
                {workoutStats?.totalDuration || 0} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Meals Logged</span>
              <span className="font-semibold text-gray-900">
                {mealStats?.totalMeals || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Daily Calories</span>
              <span className="font-semibold text-gray-900">
                {mealStats?.totalMeals > 0 
                  ? Math.round(totalCaloriesIntake / Math.min(mealStats.totalMeals, 30))
                  : 0}
              </span>
            </div>
            {user?.dailyCalorieGoal && (
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">Daily Goal</span>
                <span className="font-semibold text-gray-900">
                  {user.dailyCalorieGoal} cal
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/workouts/new"
            className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-center"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Log Workout
            </span>
          </Link>
          <Link
            to="/meals/new"
            className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-center"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Log Meal
            </span>
          </Link>
          <Link
            to="/workouts"
            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-center"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Progress
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Workouts</h2>
            <Link to="/workouts" className="text-indigo-600 hover:text-indigo-700 text-sm">
              View all →
            </Link>
          </div>
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No workouts yet</p>
              <Link
                to="/workouts/new"
                className="mt-2 inline-block text-indigo-600 hover:text-indigo-700 text-sm"
              >
                Log your first workout
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{workout.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(workout.date).toLocaleDateString()} • {workout.caloriesBurned} cal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Meals</h2>
            <Link to="/meals" className="text-indigo-600 hover:text-indigo-700 text-sm">
              View all →
            </Link>
          </div>
          {recentMeals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No meals logged yet</p>
              <Link
                to="/meals/new"
                className="mt-2 inline-block text-indigo-600 hover:text-indigo-700 text-sm"
              >
                Log your first meal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMeals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{meal.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(meal.date).toLocaleDateString()} • {Math.round(meal.totalCalories)} cal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
