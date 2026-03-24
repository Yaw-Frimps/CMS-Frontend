import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api, getImageUrl } from '../../services/api';
import { User, Moon, Sun } from 'lucide-react';

export default function MainLayout() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    console.log('Profile update event received:', event.detail);
    if (event.detail?.profileImageUrl) {
      setProfileImage(event.detail.profileImageUrl);
    } else {
      fetchProfileImage();
    }
  };

  useEffect(() => {
    // If we have a profileImageUrl in the user object, use it.
    // Otherwise, fetch it.
    if (user?.profileImageUrl) {
      setProfileImage(user.profileImageUrl);
    } else {
      fetchProfileImage();
    }
    
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
  }, [user?.memberId, user?.profileImageUrl]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <Link to="/" className="text-xl font-semibold text-gray-800 dark:text-gray-100 hover:text-primary-600 transition-colors">
            Church Management Portal
          </Link>
          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.email || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">{user?.role || 'Member'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 overflow-hidden border-2 border-primary-50 dark:border-primary-900/50 shadow-sm relative group">
                {profileImage ? (
                  <img 
                    src={getImageUrl(profileImage) || ''} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-opacity duration-300" 
                    onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                    onError={(e) => {
                      console.error("Header image failed to load:", profileImage);
                      setProfileImage(null);
                    }} 
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="container mx-auto max-w-7xl animate-fade-in duration-300 relative min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
