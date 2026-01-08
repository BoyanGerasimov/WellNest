import { useState, useEffect } from 'react';
import { suggestionService } from '../services/suggestionService';
import { LightbulbIcon, RobotIcon } from '../components/icons/Icons';

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, workout, nutrition
  const [isAI, setIsAI] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await suggestionService.getAllSuggestions();
      setSuggestions(response.data);
      setIsAI(response.data?.source?.isAI || false);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-orange-50 border-orange-500 text-orange-700';
      case 'medium':
        return 'bg-amber-50 border-amber-500 text-amber-700';
      case 'low':
        return 'bg-teal-50 border-teal-500 text-teal-700';
      default:
        return 'bg-slate-50 border-slate-500 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading suggestions...</p>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">AI Suggestions</h1>
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
          isAI 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
            : 'bg-amber-100 text-amber-800 border border-amber-300'
        }`}>
          {isAI ? (
            <span className="flex items-center gap-2">
              <RobotIcon className="w-5 h-5" />
              <span>AI-Powered</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>📋</span>
              <span>Rule-Based</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All ({suggestions?.all?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'workout'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Workout ({suggestions?.workout?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'nutrition'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Nutrition ({suggestions?.nutrition?.length || 0})
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {displaySuggestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-slate-500 mb-2">No suggestions available</p>
            <p className="text-sm text-slate-400">
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
                <div className="flex-shrink-0">
                  <LightbulbIcon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 font-medium mb-2">{suggestion.message}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : suggestion.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {suggestion.priority} priority
                    </span>
                    <span className="text-xs text-slate-500">
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
      <div className={`mt-8 rounded-lg p-4 ${
        isAI 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        <p className={`text-sm ${
          isAI ? 'text-emerald-700' : 'text-amber-700'
        }`}>
          {isAI ? (
            <>
              <strong className="flex items-center gap-2">
                <RobotIcon className="w-5 h-5" />
                AI-Powered Suggestions Active:
              </strong> Your suggestions are being generated by OpenAI's AI model, 
              providing highly personalized recommendations based on your unique data, goals, and progress patterns.
            </>
          ) : (
            <>
              <strong>📋 Rule-Based Suggestions:</strong> Currently using rule-based suggestions. To enable AI-powered suggestions, 
              add billing to your OpenAI account at{' '}
              <a 
                href="https://platform.openai.com/account/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                platform.openai.com/account/billing
              </a>
              . Once billing is active, AI suggestions will activate automatically.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Suggestions;

