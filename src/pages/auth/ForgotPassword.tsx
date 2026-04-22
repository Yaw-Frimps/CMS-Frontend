import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 right-0 -m-32 w-[500px] h-[500px] bg-primary-200/20 dark:bg-primary-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -m-32 w-[500px] h-[500px] bg-secondary-200/20 dark:bg-secondary-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-2xl shadow-2xl mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Forgot <span className="text-gradient">Password?</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">No worries, we'll send you reset instructions.</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/40 dark:border-zinc-800/50">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full group h-14 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-2xl shadow-xl shadow-primary-600/20 flex items-center justify-center font-bold text-lg transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Send Reset Link 
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Check your email</h3>
                <p className="text-zinc-500 dark:text-zinc-400">We've sent a password reset link to <span className="font-bold text-zinc-900 dark:text-zinc-200">{email}</span></p>
              </div>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
              >
                Didn't receive the email? Click to retry
              </button>
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-zinc-600 dark:text-zinc-400 font-medium">
          Remembered your password? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}
