import { useState, useEffect } from 'react';
import { Heart, Calendar, Users, Loader2, CheckCircle, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

interface EventDto {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
}

interface DonationDto {
  id: number;
  amount: number;
  fund: string;
  donationDate: string;
}

interface GroupDto {
  id: number;
  name: string;
  category: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [nextEvent, setNextEvent] = useState<EventDto | null>(null);
  const [monthlyGiving, setMonthlyGiving] = useState<number>(0);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [myGroups, setMyGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const eventsRes = await api.get<EventDto[]>('/events');
        const activeEvents = eventsRes.data.filter(e => new Date(e.startTime) > new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        if (activeEvents.length > 0) setNextEvent(activeEvents[0]);

        if (user?.memberId) {
          const [givingRes, attendanceRes, groupsRes] = await Promise.all([
            api.get<DonationDto[]>(`/donations/member/${user.memberId}`),
            api.get(`/attendance/member/${user.memberId}`),
            api.get(`/members/${user.memberId}/groups`)
          ]);

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const thisMonthTotal = givingRes.data
            .filter(d => {
              const dDate = new Date(d.donationDate);
              return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
            })
            .reduce((sum, d) => sum + d.amount, 0);

          setMonthlyGiving(thisMonthTotal);
          setAttendanceCount(attendanceRes.data.length);
          setMyGroups(groupsRes.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-10 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-primary-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -m-20 w-80 h-80 bg-secondary-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" /> Member Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Welcome back, <br/><span className="text-gradient"> {user?.email?.split('@')[0] || 'Friend'}!</span>
            </h1>
            <p className="text-zinc-400 font-medium text-lg leading-relaxed">
              We're glad to have you here. Stay updated with upcoming events, track your giving, and connect with your small groups all in one place.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/events')}
            className="flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-600/30 hover:bg-primary-500 transition-all group"
          >
            Explore Events <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Next Event */}
        <motion.div variants={item} className="glass-card p-8 flex flex-col items-start border border-white/40 dark:border-zinc-800/50">
          <div className="w-12 h-12 rounded-2xl bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 flex items-center justify-center mb-6">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Upcoming Event</h3>
          <div className="flex-1 w-full mt-2">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
            ) : nextEvent ? (
              <div className="space-y-4">
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">{nextEvent.title}</p>
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(nextEvent.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                </div>
              </div>
            ) : <p className="text-zinc-400 font-bold italic">No events planned</p>}
          </div>
          <button onClick={() => navigate('/events')} className="mt-8 text-primary-600 dark:text-primary-400 font-black text-xs uppercase tracking-tighter flex items-center group">
            Calendar <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>

        {/* Giving */}
        <motion.div variants={item} className="glass-card p-8 flex flex-col items-start border border-white/40 dark:border-zinc-800/50">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Monthly Giving</h3>
          <div className="flex-1 mt-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-300" /> : (
              <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100">${monthlyGiving.toLocaleString()}</p>
            )}
          </div>
          <button onClick={() => navigate('/donations')} className="mt-8 text-emerald-600 font-black text-xs uppercase tracking-tighter flex items-center group">
            Contribute <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>

        {/* Groups */}
        <motion.div variants={item} className="glass-card p-8 flex flex-col items-start border border-white/40 dark:border-zinc-800/50">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center mb-6">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">My Groups</h3>
          <div className="flex-1 mt-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-300" /> : (
              <div className="space-y-1">
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{myGroups.length} Active</p>
                {myGroups.length > 0 && <p className="text-xs text-zinc-500 font-bold underline underline-offset-4">{myGroups[0].name}</p>}
              </div>
            )}
          </div>
          <button onClick={() => navigate('/groups')} className="mt-8 text-primary-600 font-black text-xs uppercase tracking-tighter flex items-center group">
            Browse Groups <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>

        {/* Attendance */}
        <motion.div variants={item} className="glass-card p-8 flex flex-col items-start border border-white/40 dark:border-zinc-800/50">
          <div className="w-12 h-12 rounded-2xl bg-accent-500/10 text-accent-600 flex items-center justify-center mb-6">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Attendance</h3>
          <div className="flex-1 mt-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-300" /> : (
              <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100">{attendanceCount}</p>
            )}
          </div>
          <div className="mt-8 text-zinc-400 font-black text-[10px] uppercase tracking-widest">Lifetime Pulse</div>
        </motion.div>
      </motion.div>
    </div>
  );
}
