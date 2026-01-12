import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { weightService } from '../services/weightService';
import WeightChart from '../components/charts/WeightChart';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    height: user?.height ?? '',
    goalWeight: user?.goalWeight ?? '',
    activityLevel: user?.activityLevel ?? '',
    dailyCalorieGoal: user?.dailyCalorieGoal ?? ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [weightsLoading, setWeightsLoading] = useState(false);
  const [weightEntries, setWeightEntries] = useState([]);
  const [weightsError, setWeightsError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        height: user.height ?? '',
        goalWeight: user.goalWeight ?? '',
        activityLevel: user.activityLevel ?? '',
        dailyCalorieGoal: user.dailyCalorieGoal ?? ''
      });
    }
  }, [user]);

  useEffect(() => {
    const loadWeights = async () => {
      if (!user) return;
      setWeightsError('');
      setWeightsLoading(true);
      try {
        const res = await weightService.getWeights();
        setWeightEntries(res.data || []);
      } catch (err) {
        // If backend hasn't been migrated yet, this might fail — keep the page usable
        setWeightsError(err.response?.data?.message || 'Failed to load weight history');
        setWeightEntries([]);
      } finally {
        setWeightsLoading(false);
      }
    };
    loadWeights();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Only send editable fields (name/weight are locked)
      const payload = {
        height: formData.height === '' ? null : parseFloat(formData.height),
        goalWeight: formData.goalWeight === '' ? null : parseFloat(formData.goalWeight),
        activityLevel: formData.activityLevel || null,
        dailyCalorieGoal: formData.dailyCalorieGoal === '' ? null : parseInt(formData.dailyCalorieGoal, 10),
      };

      const response = await userService.updateProfile(payload);
      updateUser(response.user);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    }

    setLoading(false);
  };

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';
  const displayCurrentWeight = user?.currentWeight ?? null;
  const displayStartingWeight = user?.startingWeight ?? null;
  const lastCheckinLabel = useMemo(() => {
    if (!user?.lastWeightCheckinAt) return 'Not recorded yet';
    const d = new Date(user.lastWeightCheckinAt);
    if (Number.isNaN(d.getTime())) return 'Not recorded yet';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, [user?.lastWeightCheckinAt]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Profile</h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            Your account, preferences, and progress.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-weight-checkin'))}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Log weight
        </button>
      </div>

      {/* Alerts */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center ${
            message.includes('success')
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Account */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Account</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500 mt-1">Name is locked after signup.</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-semibold text-slate-900 break-all">{displayEmail}</p>
              </div>
            </div>
          </div>

          {/* Weight summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Weight tracking</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Current</p>
                <p className="text-lg font-bold text-slate-900">
                  {displayCurrentWeight != null ? `${displayCurrentWeight} kg` : '—'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Starting</p>
                <p className="text-lg font-bold text-slate-900">
                  {displayStartingWeight != null ? `${displayStartingWeight} kg` : '—'}
                </p>
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Last check‑in:</span> {lastCheckinLabel}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Weight can’t be edited here. Use weekly check‑ins to keep your progress accurate.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Preferences</h2>
                <p className="text-sm text-slate-600 mt-1">Update goals and settings (safe to change).</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Goal Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="goalWeight"
                    value={formData.goalWeight}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="65.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Activity Level</label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extremely_active">Extremely Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Daily Calorie Goal</label>
                  <input
                    type="number"
                    name="dailyCalorieGoal"
                    value={formData.dailyCalorieGoal}
                    onChange={handleChange}
                    min="1000"
                    max="10000"
                    step="1"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="2000"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving…' : 'Save preferences'}
                </button>
              </div>
            </form>
          </div>

          {/* Weight chart */}
          {weightsError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">{weightsError}</p>
            </div>
          )}
          {weightsLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-600">Loading weight chart…</p>
            </div>
          ) : (
            <WeightChart
              user={user}
              entries={weightEntries}
              startingWeight={displayStartingWeight}
              goalWeight={user?.goalWeight ?? null}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

