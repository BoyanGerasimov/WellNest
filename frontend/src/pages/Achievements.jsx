import { useState, useEffect } from 'react';
import { achievementService } from '../services/achievementService';
import { TrophyIcon, FireIcon, SnackIcon, TargetIcon, MuscleIcon } from '../components/icons/Icons';

// Map emoji icons to SVG icons
const getAchievementIcon = (emoji) => {
  const iconMap = {
    '🏆': TrophyIcon,
    '🔥': FireIcon,
    '💪': MuscleIcon,
    '🍎': SnackIcon,
    '🎯': TargetIcon,
  };
  
  const IconComponent = iconMap[emoji] || TrophyIcon;
  return <IconComponent className="w-10 h-10" />;
};

const Achievements = () => {
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [statsRes, achievementsRes] = await Promise.all([
        achievementService.getAchievementStats(),
        achievementService.getAchievements()
      ]);
      setStats(statsRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Achievements</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
            <p className="text-teal-100 text-sm mb-2">Total Achievements</p>
            <p className="text-4xl font-bold">{stats.totalAchievements}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <p className="text-yellow-100 text-sm mb-2">Total Points</p>
            <p className="text-4xl font-bold">{stats.totalPoints}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <p className="text-red-100 text-sm mb-2">Current Streak</p>
            <p className="text-4xl font-bold">{stats.currentStreak} days</p>
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Your Achievements</h2>
        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No achievements unlocked yet</p>
            <p className="text-sm text-slate-400">Start logging workouts and meals to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{achievement.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-semibold text-yellow-600">
                        +{achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;

