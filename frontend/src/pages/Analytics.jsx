import { useState } from 'react';
import { analyticsService } from '../services/analyticsService';

const Analytics = () => {
  // Set default target date to 3 months from now
  const getDefaultDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  };

  const [targetDate, setTargetDate] = useState(getDefaultDate());
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!targetDate) {
      setError('Please select a target date');
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await analyticsService.predictWeightTrajectory(targetDate);
      if (response.success) {
        setPrediction(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Predictive Analytics</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Weight Trajectory Prediction</h2>
          <p className="text-slate-600 mb-4">
            Enter a target date to predict your weight based on your current calorie intake and activity level.
          </p>

          <form onSubmit={handlePredict} className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="targetDate" className="block text-sm font-medium text-slate-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                id="targetDate"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Calculating...' : 'Predict'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {prediction && (
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Prediction Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <p className="text-sm text-slate-600 mb-1">Current Weight</p>
                <p className="text-2xl font-bold text-teal-700">{prediction.currentWeight} kg</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <p className="text-sm text-slate-600 mb-1">Goal Weight</p>
                <p className="text-2xl font-bold text-green-700">{prediction.goalWeight} kg</p>
              </div>
              <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                <p className="text-sm text-slate-600 mb-1">Predicted Weight</p>
                <p className="text-2xl font-bold text-blue-700">{prediction.predictedWeight} kg</p>
              </div>
              <div className={`rounded-lg p-4 border ${
                prediction.onTrack 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className={`text-2xl font-bold ${
                  prediction.onTrack ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {prediction.onTrack ? '✅ On Track' : '⚠️ Off Track'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-800 mb-3">Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Days Remaining</p>
                    <p className="font-semibold text-slate-800">{prediction.daysRemaining} days</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Daily Deficit</p>
                    <p className="font-semibold text-slate-800">{prediction.dailyDeficit} kcal</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Weekly Change</p>
                    <p className="font-semibold text-slate-800">{prediction.weeklyWeightChange} kg/week</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Weight Difference</p>
                    <p className={`font-semibold ${
                      Math.abs(prediction.weightDifference) < 2 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {prediction.weightDifference > 0 ? '+' : ''}{prediction.weightDifference} kg
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-800 mb-3">Metabolism</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">BMR (Basal Metabolic Rate)</p>
                    <p className="font-semibold text-slate-800">{prediction.bmr} kcal/day</p>
                  </div>
                  <div>
                    <p className="text-slate-600">TDEE (Total Daily Energy Expenditure)</p>
                    <p className="font-semibold text-slate-800">{prediction.tdee} kcal/day</p>
                  </div>
                </div>
              </div>

              {!prediction.onTrack && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You're currently off track by {Math.abs(prediction.weightDifference).toFixed(1)} kg. 
                    Consider adjusting your calorie intake or activity level to reach your goal.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

