import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Fetch user data
      authService.getMe()
        .then(response => {
          localStorage.setItem('user', JSON.stringify(response.user));
          updateUser(response.user);
          navigate('/dashboard');
        })
        .catch(error => {
          console.error('Failed to fetch user:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

