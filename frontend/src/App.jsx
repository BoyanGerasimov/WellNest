import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import Workouts from './pages/Workouts';
import WorkoutForm from './pages/WorkoutForm';
import Meals from './pages/Meals';
import MealForm from './pages/MealForm';
import Forum from './pages/Forum';
import Achievements from './pages/Achievements';

function App() {
  return (
    <AuthProvider>
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
            <Route path="/achievements" element={<Achievements />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

