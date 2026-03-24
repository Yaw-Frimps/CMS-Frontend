import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, ArrowRight, UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        admin: false
      });
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -m-32 w-[500px] h-[500px] bg-primary-200/20 dark:bg-primary-900/10 rounded-full filter blur-[100px] opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -m-32 w-[500px] h-[500px] bg-secondary-200/20 dark:bg-secondary-900/10 rounded-full filter blur-[100px] opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full relative z-10 py-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-indigo-500 rounded-2xl shadow-2xl shadow-primary-500/30 mb-6 group transition-transform hover:-rotate-6">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Create <span className="text-gradient">Account</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Join our vibrant faith community</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/40 dark:border-zinc-800/50">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl border border-red-100 dark:border-red-900/30"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">First Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary-500 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    name="firstName"
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                className="w-full px-4 py-3 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full group h-14 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-2xl shadow-xl shadow-primary-600/20 flex items-center justify-center font-bold text-lg transition-all active:scale-95 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center">
                  Create Account 
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-zinc-600 dark:text-zinc-400 font-medium">
          Already a member? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline decoration-2 underline-offset-4">Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
}
