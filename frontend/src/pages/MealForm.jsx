import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mealService } from '../services/mealService';

const MealForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'breakfast',
    date: new Date().toISOString().split('T')[0],
    foodItems: [],
    notes: ''
  });

  useEffect(() => {
    if (isEditing) {
      loadMeal();
    }
  }, [id]);

  const loadMeal = async () => {
    try {
      setLoading(true);
      const response = await mealService.getMeal(id);
      const meal = response.data;
      setFormData({
        name: meal.name || '',
        type: meal.type || 'breakfast',
        date: meal.date ? new Date(meal.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        foodItems: meal.foodItems || [],
        notes: meal.notes || ''
      });
    } catch (error) {
      console.error('Failed to load meal:', error);
      setError('Failed to load meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError(null);
      const response = await mealService.searchFood(searchQuery.trim(), 1, 10);
      if (response.success) {
        setSearchResults(response.data.foods || []);
      } else {
        setError(response.message || 'Failed to search foods. Please try again.');
      }
    } catch (error) {
      console.error('Failed to search foods:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to search foods. Please check your connection and try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFood = async (food) => {
    try {
      setLoadingNutrition(true);
      setSelectedFood(food);
      const response = await mealService.getNutrition(food.fdcId);
      setNutritionData(response.data);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
      alert('Failed to load nutrition data. Please try again.');
    } finally {
      setLoadingNutrition(false);
    }
  };

  const handleAddFoodItem = () => {
    if (!selectedFood || !nutritionData) return;

    const nutrients = nutritionData.nutrients || {};
    const foodItem = {
      fdcId: selectedFood.fdcId,
      name: selectedFood.description,
      brandOwner: selectedFood.brandOwner,
      calories: nutrients.calories || 0,
      protein: nutrients.protein || 0,
      carbs: nutrients.carbs || 0,
      fats: nutrients.fat || 0,
      servingSize: nutritionData.servingSize || 100,
      servingSizeUnit: nutritionData.servingSizeUnit || 'g'
    };

    setFormData(prev => ({
      ...prev,
      foodItems: [...prev.foodItems, foodItem]
    }));

    // Reset search
    setSelectedFood(null);
    setNutritionData(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveFoodItem = (index) => {
    setFormData(prev => ({
      ...prev,
      foodItems: prev.foodItems.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await mealService.updateMeal(id, formData);
      } else {
        await mealService.createMeal(formData);
      }
      navigate('/meals');
    } catch (error) {
      console.error('Failed to save meal:', error);
      setError(error.response?.data?.message || 'Failed to save meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return formData.foodItems.reduce((acc, item) => {
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.carbs += item.carbs || 0;
      acc.fats += item.fats || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const totals = calculateTotals();

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Meal' : 'Log New Meal'}
      </h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Meal Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Breakfast, Lunch, Dinner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Food Items</label>
              <div className="space-y-2 mb-3">
                {formData.foodItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {Math.round(item.calories)} cal
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFoodItem(index)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Meal' : 'Save Meal'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/meals')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Nutrition Summary */}
          {formData.foodItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Total Calories</span>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(totals.calories)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Protein</span>
                  <p className="text-2xl font-bold text-gray-900">{totals.protein.toFixed(1)}g</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Carbs</span>
                  <p className="text-2xl font-bold text-gray-900">{totals.carbs.toFixed(1)}g</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Fats</span>
                  <p className="text-2xl font-bold text-gray-900">{totals.fats.toFixed(1)}g</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Food Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Foods</h3>
          
          {error && error.includes('search') && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for food (e.g., apple, chicken breast)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {searchResults.map((food) => (
                <button
                  key={food.fdcId}
                  type="button"
                  onClick={() => handleSelectFood(food)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    selectedFood?.fdcId === food.fdcId
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-900">{food.description}</p>
                  {food.brandOwner && (
                    <p className="text-sm text-gray-500">{food.brandOwner}</p>
                  )}
                  {food.nutrients && (
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.round(food.nutrients.calories || 0)} cal per 100g
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}

          {loadingNutrition && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading nutrition data...</p>
            </div>
          )}

          {nutritionData && selectedFood && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedFood.description}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Calories:</span>
                  <span className="ml-2 font-medium">{Math.round(nutritionData.nutrients?.calories || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Protein:</span>
                  <span className="ml-2 font-medium">{(nutritionData.nutrients?.protein || 0).toFixed(1)}g</span>
                </div>
                <div>
                  <span className="text-gray-500">Carbs:</span>
                  <span className="ml-2 font-medium">{(nutritionData.nutrients?.carbs || 0).toFixed(1)}g</span>
                </div>
                <div>
                  <span className="text-gray-500">Fats:</span>
                  <span className="ml-2 font-medium">{(nutritionData.nutrients?.fat || 0).toFixed(1)}g</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddFoodItem}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Add to Meal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealForm;

