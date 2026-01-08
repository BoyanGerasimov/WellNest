import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import { FireIcon, ClockIcon, MuscleIcon } from '../components/icons/Icons';

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

      <div className="grid grid-cols-1 gap-4">
        {workouts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-slate-500 mb-4">No workouts yet. Start tracking your fitness journey!</p>
            <Link
              to="/workouts/new"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md"
            >
              Log Your First Workout
            </Link>
          </div>
        ) : (
          workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{workout.name}</h3>
                  <p className="text-sm text-slate-500 mb-3">
                    {new Date(workout.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex gap-6 text-sm">
                    <span className="flex items-center gap-1">
                      <FireIcon className="w-4 h-4 text-red-500" />
                      <span className="font-medium">{workout.caloriesBurned} cal</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{workout.totalDuration} min</span>
                    </span>
                    {workout.exercises && workout.exercises.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MuscleIcon className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{workout.exercises.length} exercises</span>
                      </span>
                    )}
                  </div>
                  {workout.notes && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">{workout.notes}</p>
                  )}
                  {workout.tags && workout.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {workout.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/workouts/${workout.id}/edit`)}
                    className="text-teal-600 hover:text-teal-700 px-3 py-1 rounded hover:bg-teal-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
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

