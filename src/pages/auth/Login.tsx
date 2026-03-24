import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/authenticate', { email, password });
      login(response.data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-secondary-100 dark:bg-secondary-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      
      <div className="glass max-w-md w-full rounded-2xl shadow-xl overflow-hidden animate-fade-in relative z-10">
        <div className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
              POV Int
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800/50 transition-colors duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-300"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Password</label>
                <a href="#" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-300">Forgot password?</a>
              </div>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/50 text-center transition-colors duration-300">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors duration-300">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
