import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OnboardingSurvey from '../pages/OnboardingSurvey';

// Helper function to check if user needs onboarding
const needsOnboarding = (user) => {
  if (!user) return false;
  
  // Check if required fields are missing
  return !user.dateOfBirth || 
         !user.gender || 
         !user.height || 
         !user.currentWeight || 
         !user.goalWeight || 
         !user.activityLevel;
};

const PrivateRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding (except if already on onboarding page)
  if (needsOnboarding(user) && location.pathname !== '/onboarding') {
    return <OnboardingSurvey />;
  }

  return <Outlet />;
};

export default PrivateRoute;

