import { Link, useLocation } from 'react-router-dom';
import { Home, Users, DollarSign, Calendar, Settings, LogOut, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, adminOnly: false },
    { name: 'Directory', path: '/members', icon: Users, adminOnly: true },
    { name: 'Financials', path: '/donations', icon: DollarSign, adminOnly: true },
    { name: 'Events', path: '/events', icon: Calendar, adminOnly: false },
    { name: 'Gallery Manager', path: '/gallery-manager', icon: ImageIcon, adminOnly: true },
    { name: 'Settings', path: '/settings', icon: Settings, adminOnly: false },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shadow-sm z-20 transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b border-gray-50 dark:border-gray-800 transition-colors duration-300">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent transform transition-all hover:scale-105">
          People Of Vision
        </Link>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-medium shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon 
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 dark:border-gray-800 transition-colors duration-300">
        <button 
          onClick={logout}
          className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
        >
          <LogOut className="w-5 h-5 mr-3 text-red-400 dark:text-red-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          Logout
        </button>
      </div>
    </div>
  );
}
