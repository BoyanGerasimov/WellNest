import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { mealService } from '../services/mealService';
import { barcodeService } from '../services/barcodeService';

const MealForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'barcode', 'meal'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [portionSize, setPortionSize] = useState(100); // in grams
  
  // Barcode scanner states
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [barcodeError, setBarcodeError] = useState(null);
  const [cameraScanning, setCameraScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  
  // Meal scanner states
  const [mealImage, setMealImage] = useState(null);
  const [mealPreview, setMealPreview] = useState(null);
  const [mealScanning, setMealScanning] = useState(false);
  const [mealScanResult, setMealScanResult] = useState(null);

  const [formData, setFormData] = useState({
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

  // Update date to current date when creating new meal (not editing)
  useEffect(() => {
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [isEditing]);

  // Debounced search - updates automatically as user types
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(searchTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const response = await mealService.searchFood(query, 1, 10);
      if (response.success) {
        const foods = response.data.foods || [];
        // Sort by calories (lowest first) if available
        const sortedFoods = [...foods].sort((a, b) => {
          const aCal = a.nutrients?.calories || 9999;
          const bCal = b.nutrients?.calories || 9999;
          return aCal - bCal;
        });
        setSearchResults(sortedFoods);
      } else {
        setError(response.message || 'Failed to search foods. Please try again.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Failed to search foods:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to search foods. Please check your connection and try again.';
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFood = async (food) => {
    try {
      setLoadingNutrition(true);
      setSelectedFood(food);
      const response = await mealService.getNutrition(food.fdcId);
      const data = response.data;
      setNutritionData(data);
      // Set default portion size to the serving size from nutrition data (usually 100g)
      setPortionSize(data.servingSize || 100);
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
    const baseServingSize = nutritionData.servingSize || 100; // Base serving size (usually 100g)
    const multiplier = portionSize / baseServingSize; // Calculate multiplier based on portion size

    // Calculate nutrients based on portion size
    const foodItem = {
      fdcId: selectedFood.fdcId,
      name: selectedFood.description || selectedFood.name,
      brandOwner: selectedFood.brandOwner,
      calories: Math.round((nutrients.calories || 0) * multiplier),
      protein: parseFloat(((nutrients.protein || 0) * multiplier).toFixed(2)),
      carbs: parseFloat(((nutrients.carbs || 0) * multiplier).toFixed(2)),
      fats: parseFloat(((nutrients.fat || 0) * multiplier).toFixed(2)),
      servingSize: portionSize,
      servingSizeUnit: nutritionData.servingSizeUnit || 'g'
    };

    setFormData(prev => ({
      ...prev,
      foodItems: [...prev.foodItems, foodItem]
    }));

    // Reset search
    setSelectedFood(null);
    setNutritionData(null);
    setPortionSize(100);
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('search');
  };

  // Barcode scanner handlers
  const handleBarcodeInput = async (barcode) => {
    if (!barcode || barcode.trim().length === 0) return;

    try {
      setBarcodeScanning(true);
      setBarcodeError(null);
      const response = await barcodeService.lookupBarcode(barcode.trim());
      
      if (response.success) {
        // Format as food item for selection
        const food = {
          fdcId: response.data.fdcId || response.data.barcode, // Use FDC ID if available, else barcode
          description: response.data.name || response.data.description,
          brandOwner: response.data.brand || response.data.brandOwner,
          nutrients: response.data.nutrients
        };
        
        // Set as selected food with nutrition data
        setSelectedFood(food);
        setNutritionData({
          ...response.data,
          nutrients: response.data.nutrients,
          servingSize: response.data.servingSize || 100,
          servingSizeUnit: response.data.servingSizeUnit || 'g'
        });
        setPortionSize(response.data.servingSize || 100);
        setActiveTab('search'); // Switch to search tab to show nutrition
        
        // Show note if it's a fallback result
        if (response.data.note) {
          setBarcodeError(null); // Clear any previous errors
          // Note will be shown in the nutrition display area
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to lookup barcode';
      setBarcodeError(errorMessage);
      
      // If product not found, suggest searching manually
      if (errorMessage.includes('not found')) {
        // Error message already contains helpful suggestions
      }
    } finally {
      setBarcodeScanning(false);
    }
  };

  // Camera barcode scanning handlers
  const startCameraScan = async () => {
    try {
      setBarcodeError(null);
      setCameraScanning(true);

      // Wait for the DOM element to be available
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const scannerElement = scannerRef.current;
      if (!scannerElement) {
        throw new Error('Scanner container not found');
      }

      const html5QrCode = new Html5Qrcode(scannerElement.id);
      html5QrCodeRef.current = html5QrCode;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      const cameraId = devices && devices.length > 0 ? devices[0].id : null;

      if (!cameraId) {
        throw new Error('No camera found on this device. Please ensure your device has a camera and grant camera permissions.');
      }

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF
          ]
        },
        (decodedText) => {
          // Successfully scanned a barcode
          stopCameraScan();
          handleBarcodeInput(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent while scanning)
          // Only log if it's not a common scanning error
          if (!errorMessage.includes('NotFoundException') && !errorMessage.includes('No MultiFormat Readers')) {
            // Silent - these are expected during scanning
          }
        }
      );
    } catch (error) {
      console.error('Camera scan error:', error);
      setBarcodeError(error.message || 'Failed to start camera. Please check camera permissions.');
      setCameraScanning(false);
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current = null;
        } catch (stopError) {
          // Ignore stop errors
        }
      }
    }
  };

  const stopCameraScan = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
      setCameraScanning(false);
    } catch (error) {
      console.error('Error stopping camera:', error);
      setCameraScanning(false);
    }
  };

  // Cleanup camera when tab changes or component unmounts
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        stopCameraScan();
      }
    };
  }, []);

  useEffect(() => {
    // Stop camera if user switches away from barcode tab
    if (activeTab !== 'barcode' && cameraScanning) {
      stopCameraScan();
    }
  }, [activeTab]);

  // Meal scanner handlers
  const handleMealImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setMealImage(file);
      setError(null);
      setMealScanResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMealPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanMeal = async () => {
    if (!mealImage) {
      setError('Please select an image file');
      return;
    }

    setMealScanning(true);
    setError(null);
    setMealScanResult(null);

    try {
      const response = await mealService.scanMeal(mealImage);
      if (response.success) {
        setMealScanResult(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to scan meal. Please try again.');
    } finally {
      setMealScanning(false);
    }
  };

  const handleAddScannedMeal = () => {
    if (!mealScanResult) return;

    // Add the scanned meal as a single food item
    const foodItem = {
      fdcId: `scanned-${Date.now()}`, // Use timestamp as unique ID
      name: mealScanResult.mealName,
      brandOwner: null,
      calories: Math.round(mealScanResult.nutrition?.calories || 0),
      protein: parseFloat((mealScanResult.nutrition?.protein || 0).toFixed(2)),
      carbs: parseFloat((mealScanResult.nutrition?.carbs || 0).toFixed(2)),
      fats: parseFloat((mealScanResult.nutrition?.fat || 0).toFixed(2)),
      servingSize: 1,
      servingSizeUnit: mealScanResult.servingSize || 'portion'
    };

    setFormData(prev => ({
      ...prev,
      foodItems: [...prev.foodItems, foodItem]
    }));

    // Reset meal scanner
    setMealImage(null);
    setMealPreview(null);
    setMealScanResult(null);
    setActiveTab('search');
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
      // Use meal type as the name (capitalize first letter)
      const mealData = {
        ...formData,
        name: formData.type.charAt(0).toUpperCase() + formData.type.slice(1)
      };

      if (isEditing) {
        await mealService.updateMeal(id, mealData);
      } else {
        await mealService.createMeal(mealData);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading meal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        {isEditing ? 'Edit Meal' : 'Log Meal'}
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
            {/* Meal Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Meal Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'breakfast' }))}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.type === 'breakfast'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🍳 Breakfast
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'lunch' }))}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.type === 'lunch'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🥗 Lunch
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'dinner' }))}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.type === 'dinner'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🍽️ Dinner
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'snack' }))}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.type === 'snack'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🍎 Snacks
                </button>
              </div>
            </div>

            {/* Date Display - Always current date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-700">
                {new Date(formData.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Food Items</label>
              <div className="space-y-2 mb-3">
                {formData.foodItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-slate-500 ml-2">
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
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Meal' : 'Save Meal'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/meals')}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Nutrition Summary */}
          {formData.foodItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Nutrition Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-500">Total Calories</span>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(totals.calories)}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Protein</span>
                  <p className="text-2xl font-bold text-slate-900">{totals.protein.toFixed(1)}g</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Carbs</span>
                  <p className="text-2xl font-bold text-slate-900">{totals.carbs.toFixed(1)}g</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Fats</span>
                  <p className="text-2xl font-bold text-slate-900">{totals.fats.toFixed(1)}g</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Food Search/Scanner */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              🔍 Search
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('barcode')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'barcode'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              📷 Barcode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('meal')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'meal'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              🍽️ Meal Scanner
            </button>
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Foods</h3>
              
              {error && error.includes('search') && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
          
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search (e.g., apple, chicken breast)..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                </div>
              )}
            </div>
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="mt-2 text-xs text-slate-500">Type at least 2 characters to search</p>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </span>
                <span className="text-xs text-slate-500">
                  Sorted by calories (lowest first)
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((food) => (
                <button
                  key={food.fdcId}
                  type="button"
                  onClick={() => handleSelectFood(food)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    selectedFood?.fdcId === food.fdcId
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-medium text-slate-900">{food.description}</p>
                  {food.brandOwner && (
                    <p className="text-sm text-slate-500">{food.brandOwner}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {food.nutrients && food.nutrients.calories > 0 
                      ? `${Math.round(food.nutrients.calories)} cal per 100g`
                      : 'Loading calories...'}
                  </p>
                </button>
                ))}
              </div>
            </div>
          )}

          {loadingNutrition && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-2 text-sm text-slate-500">Loading nutrition data...</p>
            </div>
          )}

          {/* Nutrition Display (shown when food is selected from any tab) */}
          {nutritionData && selectedFood && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-slate-900 mb-3">{selectedFood.description}</h4>
              {nutritionData.note && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  ℹ️ {nutritionData.note}
                </div>
              )}
              
              {/* Portion Size Input */}
              <div className="mb-4">
                <label htmlFor="portionSize" className="block text-sm font-medium text-slate-700 mb-2">
                  Portion Size (grams)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="portionSize"
                    inputMode="numeric"
                    value={portionSize === 0 ? '' : portionSize.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string (for deletion)
                      if (value === '') {
                        setPortionSize(0);
                      } else {
                        // Only allow numbers
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue) && numValue >= 0) {
                          setPortionSize(numValue);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // If empty or 0 on blur, set to default serving size
                      const value = parseFloat(e.target.value);
                      if (!value || value === 0) {
                        setPortionSize(nutritionData.servingSize || 100);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="100"
                  />
                  <span className="px-3 py-2 text-slate-600">g</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Base serving: {nutritionData.servingSize || 100}{nutritionData.servingSizeUnit || 'g'}
                </p>
                {portionSize === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    ⚠️ Portion size cannot be 0
                  </p>
                )}
              </div>

              {/* Nutrition Values (calculated based on portion size) */}
              {portionSize > 0 ? (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-2">Nutrition for {portionSize}g:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Calories:</span>
                      <span className="ml-2 font-medium">
                        {Math.round((nutritionData.nutrients?.calories || 0) * (portionSize / (nutritionData.servingSize || 100)))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Protein:</span>
                      <span className="ml-2 font-medium">
                        {((nutritionData.nutrients?.protein || 0) * (portionSize / (nutritionData.servingSize || 100))).toFixed(1)}g
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Carbs:</span>
                      <span className="ml-2 font-medium">
                        {((nutritionData.nutrients?.carbs || 0) * (portionSize / (nutritionData.servingSize || 100))).toFixed(1)}g
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Fats:</span>
                      <span className="ml-2 font-medium">
                        {((nutritionData.nutrients?.fat || 0) * (portionSize / (nutritionData.servingSize || 100))).toFixed(1)}g
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">Enter a portion size to see nutrition values</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddFoodItem}
                disabled={portionSize === 0 || portionSize < 1}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Add to Meal
              </button>
            </div>
          )}
          </>)}

          {/* Barcode Scanner Tab */}
          {activeTab === 'barcode' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Scan Barcode</h3>
              
              {barcodeError && (
                <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded text-sm">
                  <p className="font-medium mb-2">{barcodeError}</p>
                  {barcodeError.includes('not found') && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('search');
                        setBarcodeError(null);
                      }}
                      className="mt-2 text-sm text-amber-700 underline hover:text-amber-900"
                    >
                      Switch to Search tab to find similar products
                    </button>
                  )}
                </div>
              )}

              {/* Camera Scanner */}
              {!cameraScanning ? (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={startCameraScan}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold mb-4 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Scan with Camera
                  </button>
                  <div className="text-center text-sm text-slate-500 mb-4">or</div>
                </div>
              ) : (
                <div className="mb-4">
                  <div 
                    id="barcode-scanner" 
                    ref={scannerRef} 
                    className="w-full rounded-lg overflow-hidden mb-3"
                    style={{ minHeight: '300px' }}
                  ></div>
                  <button
                    type="button"
                    onClick={stopCameraScan}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Stop Camera
                  </button>
                  <p className="mt-2 text-xs text-center text-slate-500">
                    Point your camera at a barcode to scan
                  </p>
                </div>
              )}

              {/* Manual Input */}
              {!cameraScanning && (
                <div className="mb-4">
                  <label htmlFor="barcodeInput" className="block text-sm font-medium text-slate-700 mb-2">
                    Or Enter Barcode Manually (UPC, EAN, etc.)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="barcodeInput"
                      inputMode="numeric"
                      placeholder="Enter barcode number..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleBarcodeInput(e.target.value);
                        }
                      }}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('barcodeInput');
                        if (input) handleBarcodeInput(input.value);
                      }}
                      disabled={barcodeScanning}
                      className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg font-semibold disabled:cursor-not-allowed"
                    >
                      {barcodeScanning ? 'Looking up...' : 'Lookup'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Enter the barcode number from a food product package
                  </p>
                </div>
              )}

              {barcodeScanning && !cameraScanning && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Looking up product...</p>
                </div>
              )}
            </div>
          )}

          {/* Meal Scanner Tab */}
          {activeTab === 'meal' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Scan Meal/Recipe</h3>
              
              {error && error.includes('scan') && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              {!mealPreview ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMealImageChange}
                    className="hidden"
                    id="meal-image"
                  />
                  <label
                    htmlFor="meal-image"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-12 h-12 text-slate-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-slate-600 font-medium">Click to upload meal/recipe image</span>
                    <span className="text-sm text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={mealPreview}
                      alt="Meal preview"
                      className="w-full max-h-64 object-contain rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMealImage(null);
                        setMealPreview(null);
                        setMealScanResult(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleScanMeal}
                    disabled={mealScanning}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white px-4 py-3 rounded-lg font-semibold disabled:cursor-not-allowed"
                  >
                    {mealScanning ? 'Scanning Meal...' : 'Scan Meal'}
                  </button>
                </div>
              )}

              {mealScanning && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Analyzing meal image...</p>
                </div>
              )}

              {mealScanResult && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">Identified Meal:</h4>
                  <p className="text-slate-800 font-medium mb-4">{mealScanResult.mealName}</p>
                  
                  {mealScanResult.nutrition && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 mb-2">Estimated Nutrition ({mealScanResult.servingSize}):</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">Calories:</span>
                          <span className="ml-2 font-semibold text-slate-900">
                            {Math.round(mealScanResult.nutrition.calories || 0)} kcal
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Protein:</span>
                          <span className="ml-2 font-semibold text-slate-900">
                            {parseFloat((mealScanResult.nutrition.protein || 0).toFixed(1))}g
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Carbs:</span>
                          <span className="ml-2 font-semibold text-slate-900">
                            {parseFloat((mealScanResult.nutrition.carbs || 0).toFixed(1))}g
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Fat:</span>
                          <span className="ml-2 font-semibold text-slate-900">
                            {parseFloat((mealScanResult.nutrition.fat || 0).toFixed(1))}g
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleAddScannedMeal}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Add Meal to Log
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealForm;

