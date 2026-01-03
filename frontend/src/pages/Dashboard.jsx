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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalCaloriesBurned = workoutStats?.totalCaloriesBurned || 0;
  const totalCaloriesIntake = mealStats?.totalCalories || 0;
  const netCalories = totalCaloriesIntake - totalCaloriesBurned;
  const totalWorkouts = workoutStats?.totalWorkouts || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="mt-1.5 text-slate-600">
            Here's your fitness overview for the last 30 days
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/workouts/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Log Workout
          </Link>
          <Link
            to="/meals/new"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Log Meal
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Workouts</p>
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💪</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalWorkouts}</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Calories Intake</p>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🍎</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{Math.round(totalCaloriesIntake).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Calories Burned</p>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔥</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{Math.round(totalCaloriesBurned).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Net Calories</p>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </div>
          <p className={`text-3xl font-bold ${netCalories >= 0 ? 'text-slate-900' : 'text-orange-600'}`}>
            {netCalories >= 0 ? '+' : ''}{Math.round(netCalories).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Intake - Burned</p>
        </div>
      </div>

      {/* Health Score & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {healthScore && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Health Score</h2>
              <span className="text-2xl font-bold text-teal-600">{healthScore.grade}</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Overall Score</span>
                <span className="text-xl font-bold text-slate-900">
                  {healthScore.totalScore}/{healthScore.maxScore}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${healthScore.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(healthScore.factors).slice(0, 4).map(([key, factor]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">{factor.label}</p>
                  <p className="text-sm font-semibold text-slate-900">{factor.score}/{factor.maxScore}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {achievementStats && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Achievements</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-600">{achievementStats.totalAchievements}</p>
                <p className="text-xs text-slate-500 mt-1">Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{achievementStats.totalPoints}</p>
                <p className="text-xs text-slate-500 mt-1">Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{achievementStats.currentStreak}</p>
                <p className="text-xs text-slate-500 mt-1">Day Streak</p>
              </div>
            </div>
            {achievementStats.achievements && achievementStats.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {achievementStats.achievements.slice(0, 5).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200"
                    title={achievement.description}
                  >
                    <span className="text-lg">{achievement.icon}</span>
                    <span className="text-xs font-medium text-slate-700">{achievement.title}</span>
                  </div>
                ))}
                {achievementStats.achievements.length > 5 && (
                  <div className="flex items-center justify-center bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
                    <span className="text-xs text-slate-500">
                      +{achievementStats.achievements.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalorieChart mealStats={mealStats} workoutStats={workoutStats} />
        <WorkoutFrequencyChart workouts={workoutStats?.workouts || []} />
      </div>

      {/* Recent Activity & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Workouts</h2>
              <Link to="/workouts" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View all →
              </Link>
            </div>
            {recentWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No workouts yet</p>
                <Link
                  to="/workouts/new"
                  className="mt-2 inline-block text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Log your first workout
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{workout.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(workout.date).toLocaleDateString()} • {workout.caloriesBurned} cal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Meals</h2>
              <Link to="/meals" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View all →
              </Link>
            </div>
            {recentMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No meals logged yet</p>
                <Link
                  to="/meals/new"
                  className="mt-2 inline-block text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Log your first meal
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentMeals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{meal.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(meal.date).toLocaleDateString()} • {Math.round(meal.totalCalories)} cal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {suggestions && suggestions.all && suggestions.all.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">💡 Suggestions</h2>
              <div className="space-y-3">
                {suggestions.all.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      suggestion.priority === 'high'
                        ? 'bg-orange-50 border-orange-500'
                        : suggestion.priority === 'medium'
                        ? 'bg-amber-50 border-amber-500'
                        : 'bg-teal-50 border-teal-500'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{suggestion.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{suggestion.message}</p>
                        <span
                          className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                            suggestion.priority === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : suggestion.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          {suggestion.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Workout Time</span>
                <span className="text-sm font-semibold text-slate-900">
                  {workoutStats?.totalDuration || 0} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Meals Logged</span>
                <span className="text-sm font-semibold text-slate-900">
                  {mealStats?.totalMeals || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Avg Daily Calories</span>
                <span className="text-sm font-semibold text-slate-900">
                  {mealStats?.totalMeals > 0 
                    ? Math.round(totalCaloriesIntake / Math.min(mealStats.totalMeals, 30))
                    : 0}
                </span>
              </div>
              {user?.dailyCalorieGoal && (
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Daily Goal</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {user.dailyCalorieGoal} cal
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
