import { useState } from 'react';
import { recipeService } from '../services/recipeService';

const RecipeScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
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
      setSelectedFile(file);
      setError(null);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await recipeService.scanRecipe(selectedFile);
      if (response.success) {
        setResult(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to scan recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Recipe Scanner</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Scan Recipe from Image</h2>
          <p className="text-gray-600 mb-4">
            Upload an image of a recipe to extract ingredients and get nutrition information.
          </p>

          {!preview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="recipe-image"
              />
              <label
                htmlFor="recipe-image"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-4"
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
                <span className="text-gray-600 font-medium">Click to upload recipe image</span>
                <span className="text-sm text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Recipe preview"
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Scanning Recipe...' : 'Scan Recipe'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Scanned Recipe</h2>

            {/* Extracted Text */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Extracted Text</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.text}</p>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Ingredients ({result.totalIngredients} found)
              </h3>
              <div className="space-y-2">
                {result.ingredients.map((ingredient, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-800">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Data */}
            {result.nutritionData && result.nutritionData.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Nutrition Information ({result.foundNutritionData} of {result.totalIngredients} found)
                </h3>
                <div className="space-y-4">
                  {result.nutritionData.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">{item.ingredient}</h4>
                      {item.nutrition ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Calories</p>
                            <p className="font-semibold text-gray-800">{item.nutrition.calories} kcal</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Protein</p>
                            <p className="font-semibold text-gray-800">{item.nutrition.protein}g</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Carbs</p>
                            <p className="font-semibold text-gray-800">{item.nutrition.carbs}g</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fat</p>
                            <p className="font-semibold text-gray-800">{item.nutrition.fat}g</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-yellow-600">
                          {item.error || 'Nutrition data not available'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeScanner;

