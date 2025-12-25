import { useState, useEffect } from 'react';
import { suggestionService } from '../services/suggestionService';

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, workout, nutrition

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await suggestionService.getAllSuggestions();
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      case 'low':
        return 'bg-blue-50 border-blue-500 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  const displaySuggestions =
    activeTab === 'all'
      ? suggestions?.all || []
      : activeTab === 'workout'
      ? suggestions?.workout || []
      : suggestions?.nutrition || [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Suggestions</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({suggestions?.all?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'workout'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Workout ({suggestions?.workout?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'nutrition'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nutrition ({suggestions?.nutrition?.length || 0})
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {displaySuggestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-2">No suggestions available</p>
            <p className="text-sm text-gray-400">
              Start logging workouts and meals to get personalized suggestions!
            </p>
          </div>
        ) : (
          displaySuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border-l-4 ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{suggestion.icon || '💡'}</span>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-2">{suggestion.message}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : suggestion.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {suggestion.priority} priority
                    </span>
                    <span className="text-xs text-gray-500">
                      {suggestion.type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm text-indigo-700">
          <strong>💡 How it works:</strong> Our AI analyzes your workout and nutrition data to provide
          personalized suggestions based on your goals, activity level, and progress. Suggestions are
          updated in real-time as you log activities.
        </p>
      </div>
    </div>
  );
};

export default Suggestions;

