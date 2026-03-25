import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api, getImageUrl } from '../../services/api';
import { User, Moon, Sun, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImageUrl || null);

  const fetchProfileImage = async () => {
    if (user?.memberId) {
      try {
        const res = await api.get(`/members/${user.memberId}`);
        const imageUrl = res.data.profileImageUrl || null;
        setProfileImage(imageUrl);
      } catch (error) {
        console.error("Failed to fetch profile image", error);
      }
    }
  };

  const handleProfileUpdate = (event: CustomEvent) => {
    if (event.detail?.profileImageUrl) {
      setProfileImage(event.detail.profileImageUrl);
    } else {
      fetchProfileImage();
    }
  };

  useEffect(() => {
    if (user?.profileImageUrl) {
      setProfileImage(user.profileImageUrl);
    } else {
      fetchProfileImage();
    }
    
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
  }, [user?.memberId, user?.profileImageUrl]);

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-zinc-950 overflow-hidden font-sans transition-colors duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary-200/20 dark:bg-primary-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-secondary-200/20 dark:bg-secondary-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>

        {/* Top Navbar */}
        <header className="h-16 glass z-30 flex items-center justify-between px-8 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-zinc-800 dark:text-zinc-100 group transition-all">
              <span className="text-gradient">POV</span> <span className="hidden sm:inline">Int Manager</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="p-2 text-zinc-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-secondary-600 dark:text-zinc-400 dark:hover:text-secondary-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-widest">{user?.role || 'Member'}</p>
              </div>
              <Link to="/settings" className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 p-[2px] shadow-lg shadow-primary-500/20 group transition-all hover:scale-105 active:scale-95">
                <div className="w-full h-full rounded-[10px] bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img 
                      src={getImageUrl(profileImage) || ''} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      onError={() => setProfileImage(null)} 
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary-500" />
                  )}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10">
          <div className="container mx-auto max-w-7xl p-6 lg:p-10 min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
