import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mealService } from '../services/mealService';

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setLoading(true);
      const response = await mealService.getMeals({ limit: 20 });
      setMeals(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to load meals:', error);
      setError('Failed to load meals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await mealService.deleteMeal(id);
        loadMeals();
      } catch (error) {
        console.error('Failed to delete meal:', error);
        alert('Failed to delete meal. Please try again.');
      }
    }
  };

  const getMealTypeColor = (type) => {
    const colors = {
      breakfast: 'bg-yellow-100 text-yellow-700',
      lunch: 'bg-blue-100 text-blue-700',
      dinner: 'bg-teal-100 text-teal-700',
      snack: 'bg-green-100 text-green-700'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading meals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">My Meals</h1>
        <Link
          to="/meals/new"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          + Log Meal
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {meals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 mb-4">No meals logged yet. Start tracking your nutrition!</p>
            <Link
              to="/meals/new"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Log Your First Meal
            </Link>
          </div>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 break-words">{meal.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getMealTypeColor(meal.type)}`}>
                        {meal.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(meal.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/meals/${meal.id}/edit`)}
                      className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
                      title="Edit meal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(meal.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
                      title="Delete meal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500 block mb-1">Calories</span>
                      <p className="text-lg font-bold text-slate-900">{Math.round(meal.totalCalories)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500 block mb-1">Protein</span>
                      <p className="text-lg font-bold text-slate-900">{meal.totalProtein.toFixed(1)}g</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500 block mb-1">Carbs</span>
                      <p className="text-lg font-bold text-slate-900">{meal.totalCarbs.toFixed(1)}g</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500 block mb-1">Fats</span>
                      <p className="text-lg font-bold text-slate-900">{meal.totalFats.toFixed(1)}g</p>
                    </div>
                  </div>
                  {meal.foodItems && meal.foodItems.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Food items:</p>
                      <div className="flex flex-wrap gap-2">
                        {meal.foodItems.slice(0, 5).map((item, index) => (
                          <span key={index} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md font-medium">
                            {item.name || item.description}
                          </span>
                        ))}
                        {meal.foodItems.length > 5 && (
                          <span className="text-xs text-slate-500 px-2.5 py-1">+{meal.foodItems.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  {meal.notes && (
                    <p className="mt-4 text-sm text-slate-600 break-words">{meal.notes}</p>
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

export default Meals;

