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

      <div className="grid grid-cols-1 gap-4">
        {meals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-slate-500 mb-4">No meals logged yet. Start tracking your nutrition!</p>
            <Link
              to="/meals/new"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md"
            >
              Log Your First Meal
            </Link>
          </div>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{meal.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(meal.type)}`}>
                      {meal.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    {new Date(meal.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-slate-500">Calories</span>
                      <p className="font-semibold text-slate-900">{Math.round(meal.totalCalories)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Protein</span>
                      <p className="font-semibold text-slate-900">{meal.totalProtein.toFixed(1)}g</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Carbs</span>
                      <p className="font-semibold text-slate-900">{meal.totalCarbs.toFixed(1)}g</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Fats</span>
                      <p className="font-semibold text-slate-900">{meal.totalFats.toFixed(1)}g</p>
                    </div>
                  </div>
                  {meal.foodItems && meal.foodItems.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-slate-600 mb-1">Food items:</p>
                      <div className="flex flex-wrap gap-2">
                        {meal.foodItems.slice(0, 5).map((item, index) => (
                          <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                            {item.name || item.description}
                          </span>
                        ))}
                        {meal.foodItems.length > 5 && (
                          <span className="text-xs text-slate-500">+{meal.foodItems.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  {meal.notes && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">{meal.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/meals/${meal.id}/edit`)}
                    className="text-teal-600 hover:text-teal-700 px-3 py-1 rounded hover:bg-teal-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
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

export default Meals;

