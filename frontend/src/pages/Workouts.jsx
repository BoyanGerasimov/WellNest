import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getWorkouts({ limit: 20 });
      setWorkouts(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to load workouts:', error);
      setError('Failed to load workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutService.deleteWorkout(id);
        loadWorkouts();
      } catch (error) {
        console.error('Failed to delete workout:', error);
        alert('Failed to delete workout. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">My Workouts</h1>
        <Link
          to="/workouts/new"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          + Log Workout
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {workouts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 mb-4">No workouts yet. Start tracking your fitness journey!</p>
            <Link
              to="/workouts/new"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Log Your First Workout
            </Link>
          </div>
        ) : (
          workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 break-words mb-2">{workout.name}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(workout.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/workouts/${workout.id}/edit`)}
                      className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
                      title="Edit workout"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
                      title="Delete workout"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500 block mb-1">Calories burned</span>
                      <p className="text-lg font-bold text-slate-900">{Math.round(workout.caloriesBurned || 0)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500 block mb-1">Duration (min)</span>
                      <p className="text-lg font-bold text-slate-900">{Math.round(workout.totalDuration || 0)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500 block mb-1">Exercises</span>
                      <p className="text-lg font-bold text-slate-900">
                        {Array.isArray(workout.exercises) ? workout.exercises.length : 0}
                      </p>
                    </div>
                  </div>

                  {workout.tags && workout.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {workout.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {workout.notes && (
                    <p className="mt-4 text-sm text-slate-600 break-words">{workout.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Workouts;

