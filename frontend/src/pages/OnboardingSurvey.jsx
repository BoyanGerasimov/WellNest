import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { HandWaveIcon, LightbulbIcon } from '../components/icons/Icons';

const OnboardingSurvey = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    height: '',
    currentWeight: '',
    goalWeight: '',
    activityLevel: '',
    dailyCalorieGoal: ''
  });

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate BMR and TDEE to suggest calorie goal
  const calculateCalorieGoal = () => {
    if (!formData.dateOfBirth || !formData.gender || !formData.height || !formData.currentWeight || !formData.activityLevel) {
      return null;
    }

    const age = calculateAge(formData.dateOfBirth);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.currentWeight);
    
    // Mifflin-St Jeor Equation
    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (formData.gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 78; // Average
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[formData.activityLevel] || 1.2);
    
    // Suggest calorie goal based on goal weight
    if (formData.goalWeight) {
      const goalWeight = parseFloat(formData.goalWeight);
      const weightDiff = weight - goalWeight;
      
      if (weightDiff > 0) {
        // Weight loss: 500-1000 cal deficit per day
        return Math.round(tdee - 750);
      } else if (weightDiff < 0) {
        // Weight gain: 300-500 cal surplus per day
        return Math.round(tdee + 400);
      }
    }
    
    return Math.round(tdee);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-calculate calorie goal when relevant fields change
    if (['dateOfBirth', 'gender', 'height', 'currentWeight', 'activityLevel', 'goalWeight'].includes(name)) {
      const suggestedCalories = calculateCalorieGoal();
      if (suggestedCalories && !formData.dailyCalorieGoal) {
        setFormData(prev => ({
          ...prev,
          dailyCalorieGoal: suggestedCalories.toString()
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.dateOfBirth || !formData.gender || !formData.height || 
          !formData.currentWeight || !formData.goalWeight || !formData.activityLevel) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const updateData = {
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        height: parseFloat(formData.height),
        currentWeight: parseFloat(formData.currentWeight),
        goalWeight: parseFloat(formData.goalWeight),
        activityLevel: formData.activityLevel,
        dailyCalorieGoal: formData.dailyCalorieGoal ? parseInt(formData.dailyCalorieGoal) : calculateCalorieGoal()
      };

      const response = await userService.updateProfile(updateData);
      if (response.success) {
        updateUser(response.user);
        // Onboarding complete - redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile information');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.dateOfBirth || !formData.gender) {
        setError('Please fill in all fields');
        return;
      }
    } else if (step === 2) {
      if (!formData.height || !formData.currentWeight || !formData.goalWeight) {
        setError('Please fill in all fields');
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4">
            <HandWaveIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to WellNest!
          </h1>
          <p className="text-slate-600">
            Let's set up your profile to get personalized recommendations
          </p>
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Step {step} of 3</span>
              <span className="text-xs font-medium text-slate-600">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Body Metrics */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="height" className="block text-sm font-semibold text-slate-700 mb-2">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="100"
                  max="250"
                  step="0.1"
                  placeholder="e.g., 175"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="currentWeight" className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="currentWeight"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  min="30"
                  max="300"
                  step="0.1"
                  placeholder="e.g., 70"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="goalWeight" className="block text-sm font-semibold text-slate-700 mb-2">
                  Goal Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="goalWeight"
                  name="goalWeight"
                  value={formData.goalWeight}
                  onChange={handleChange}
                  min="30"
                  max="300"
                  step="0.1"
                  placeholder="e.g., 65"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Activity & Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="activityLevel" className="block text-sm font-semibold text-slate-700 mb-2">
                  Activity Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                  <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
                </select>
              </div>

              <div>
                <label htmlFor="dailyCalorieGoal" className="block text-sm font-semibold text-slate-700 mb-2">
                  Daily Calorie Goal (kcal)
                </label>
                <input
                  type="number"
                  id="dailyCalorieGoal"
                  name="dailyCalorieGoal"
                  value={formData.dailyCalorieGoal}
                  onChange={handleChange}
                  min="1000"
                  max="10000"
                  step="1"
                  placeholder={calculateCalorieGoal() ? `Suggested: ${calculateCalorieGoal()}` : 'e.g., 2000'}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {calculateCalorieGoal() && !formData.dailyCalorieGoal && (
                  <p className="mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <LightbulbIcon className="w-4 h-4" />
                      Based on your info, we suggest {calculateCalorieGoal()} kcal/day
                    </span>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OnboardingSurvey;

