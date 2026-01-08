import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';

// Lazy load heavy components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Workouts = lazy(() => import('./pages/Workouts'));
const WorkoutForm = lazy(() => import('./pages/WorkoutForm'));
const Meals = lazy(() => import('./pages/Meals'));
const MealForm = lazy(() => import('./pages/MealForm'));
const Forum = lazy(() => import('./pages/Forum'));
const ForumPostForm = lazy(() => import('./pages/ForumPostForm'));
const ForumPostDetail = lazy(() => import('./pages/ForumPostDetail'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Suggestions = lazy(() => import('./pages/Suggestions'));
const ChatCoach = lazy(() => import('./pages/ChatCoach'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Component cache for preloading
const componentCache = new Map();

// Preload component
const preloadComponent = (componentLoader) => {
  if (!componentCache.has(componentLoader)) {
    componentCache.set(componentLoader, componentLoader());
  }
  return componentCache.get(componentLoader);
};

// Preload commonly used pages on idle
const preloadCommonPages = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload dashboard, workouts, and meals (most commonly used)
      preloadComponent(() => import('./pages/Dashboard'));
      preloadComponent(() => import('./pages/Workouts'));
      preloadComponent(() => import('./pages/Meals'));
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      preloadComponent(() => import('./pages/Dashboard'));
      preloadComponent(() => import('./pages/Workouts'));
      preloadComponent(() => import('./pages/Meals'));
    }, 2000);
  }
};

// Component to handle preloading based on navigation
const PreloadHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Preload related pages when user navigates
    const path = location.pathname;
    
    if (path.startsWith('/dashboard')) {
      preloadComponent(() => import('./pages/Workouts'));
      preloadComponent(() => import('./pages/Meals'));
    } else if (path.startsWith('/workouts')) {
      preloadComponent(() => import('./pages/Meals'));
      preloadComponent(() => import('./pages/Dashboard'));
    } else if (path.startsWith('/meals')) {
      preloadComponent(() => import('./pages/Workouts'));
      preloadComponent(() => import('./pages/Dashboard'));
    }
  }, [location]);
  
  return null;
};

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
      <p className="mt-4 text-slate-600">Loading...</p>
    </div>
  </div>
);

function App() {
  // Preload common pages after initial render
  useEffect(() => {
    preloadCommonPages();
  }, []);

  return (
    <AuthProvider>
      <PreloadHandler />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workouts/new" element={<WorkoutForm />} />
              <Route path="/workouts/:id/edit" element={<WorkoutForm />} />
              <Route path="/meals" element={<Meals />} />
              <Route path="/meals/new" element={<MealForm />} />
              <Route path="/meals/:id/edit" element={<MealForm />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/new" element={<ForumPostForm />} />
              <Route path="/forum/:id" element={<ForumPostDetail />} />
              <Route path="/forum/:id/edit" element={<ForumPostForm />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/suggestions" element={<Suggestions />} />
              <Route path="/chat" element={<ChatCoach />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;

