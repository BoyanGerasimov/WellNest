import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { weightService } from '../services/weightService';

const WeightCheckinModal = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const [weight, setWeight] = useState(user?.currentWeight ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await weightService.createWeight(parseFloat(weight));
      if (res.user) updateUser(res.user);
      onClose?.(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save weight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.(false)} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Weekly weight check‑in</h2>
          <p className="text-sm text-slate-600 mt-1">
            Log your current weight to keep your progress chart accurate.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => onClose?.(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg transition-colors"
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeightCheckinModal;


