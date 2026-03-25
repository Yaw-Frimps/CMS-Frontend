import { Link, useLocation } from 'react-router-dom';
import { Home, Users, DollarSign, Calendar, Settings, LogOut, Image as ImageIcon, ChevronRight, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, adminOnly: false },
    { name: 'Directory', path: '/members', icon: Users, adminOnly: true },
    { name: 'Financials', path: '/donations', icon: DollarSign, adminOnly: true },
    { name: 'Events', path: '/events', icon: Calendar, adminOnly: false },
    { name: 'Groups', path: '/groups', icon: Layers, adminOnly: false },
    { name: 'Gallery Manager', path: '/gallery-manager', icon: ImageIcon, adminOnly: true },
    { name: 'Settings', path: '/settings', icon: Settings, adminOnly: false },
  ];

  return (
    <div className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col z-40 transition-colors duration-500 relative">
      <div className="h-24 flex items-center justify-center px-6 mt-4 mb-2">
        <Link to="/" className="flex flex-col items-center justify-center space-y-2 group w-full text-center">
          <img src="/logo.png" alt="People Of Vision Logo" className="w-auto h-12 object-contain group-hover:scale-105 transition-transform duration-300" />
          <span className="text-sm font-bold font-headline text-zinc-800 dark:text-zinc-100 leading-tight">
            People of Vision<br/><span className="text-primary-600 dark:text-primary-400">International</span>
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item, index) => {
          if (item.adminOnly && !isAdmin) return null;
          
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 font-semibold' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center">
                  <div className={`mr-4 p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600' : 'bg-transparent text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {item.name}
                </div>
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full" />
                )}
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-zinc-300 dark:text-zinc-600'}`} />
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/50">
        <button 
          onClick={logout}
          className="flex w-full items-center px-4 py-3.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all group"
        >
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/20 mr-4 transition-colors">
            <LogOut className="w-5 h-5 transition-colors" />
          </div>
          Logout
        </button>
      </div>
    </div>
  );
}
