import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workoutService } from '../services/workoutService';

const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    exercises: [],
    totalDuration: 0,
    caloriesBurned: 0,
    notes: '',
    tags: []
  });

  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    duration: ''
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadWorkout();
    }
  }, [id]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getWorkout(id);
      const workout = response.data;
      setFormData({
        name: workout.name || '',
        date: workout.date ? new Date(workout.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        exercises: workout.exercises || [],
        totalDuration: workout.totalDuration || 0,
        caloriesBurned: workout.caloriesBurned || 0,
        notes: workout.notes || '',
        tags: workout.tags || []
      });
    } catch (error) {
      console.error('Failed to load workout:', error);
      setError('Failed to load workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalDuration' || name === 'caloriesBurned' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddExercise = () => {
    if (newExercise.name.trim()) {
      setFormData(prev => ({
        ...prev,
        exercises: [...prev.exercises, {
          name: newExercise.name,
          sets: newExercise.sets || null,
          reps: newExercise.reps || null,
          weight: newExercise.weight || null,
          duration: newExercise.duration || null
        }]
      }));
      setNewExercise({ name: '', sets: '', reps: '', weight: '', duration: '' });
    }
  };

  const handleRemoveExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await workoutService.updateWorkout(id, formData);
      } else {
        await workoutService.createWorkout(formData);
      }
      navigate('/workouts');
    } catch (error) {
      console.error('Failed to save workout:', error);
      setError(error.response?.data?.message || 'Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Workout' : 'Log New Workout'}
      </h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Workout Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Morning Run, Gym Session"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="totalDuration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="totalDuration"
              name="totalDuration"
              min="0"
              value={formData.totalDuration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="caloriesBurned" className="block text-sm font-medium text-gray-700 mb-1">
              Calories Burned
            </label>
            <input
              type="number"
              id="caloriesBurned"
              name="caloriesBurned"
              min="0"
              value={formData.caloriesBurned}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Exercises</label>
          <div className="space-y-2 mb-3">
            {formData.exercises.map((exercise, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <span className="font-medium">{exercise.name}</span>
                  {(exercise.sets || exercise.reps || exercise.weight || exercise.duration) && (
                    <span className="text-sm text-gray-500 ml-2">
                      {exercise.sets && `Sets: ${exercise.sets}`}
                      {exercise.reps && ` Reps: ${exercise.reps}`}
                      {exercise.weight && ` Weight: ${exercise.weight}kg`}
                      {exercise.duration && ` Duration: ${exercise.duration}min`}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Exercise name"
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddExercise}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Add Exercise
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="number"
              placeholder="Sets"
              value={newExercise.sets}
              onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Reps"
              value={newExercise.reps}
              onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={newExercise.weight}
              onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Duration (min)"
              value={newExercise.duration}
              onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-indigo-700 hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Add Tag
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Add any additional notes about your workout..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Workout' : 'Save Workout'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/workouts')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm;

