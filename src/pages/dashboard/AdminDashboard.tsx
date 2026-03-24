import { useState, useEffect } from 'react';
import { Activity, Users, DollarSign, Calendar, TrendingUp, ArrowUpRight, Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [totalMembers, setTotalMembers] = useState(0);
  const [monthlyGiving, setMonthlyGiving] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [activeGroups, setActiveGroups] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [membersRes, donationsRes, eventsRes, groupsRes] = await Promise.all([
          api.get('/members'),
          api.get('/donations'),
          api.get('/events'),
          api.get('/groups')
        ]);

        setTotalMembers(membersRes.data.length);
        
        const donations = donationsRes.data;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthDonations = donations.filter((d: any) => {
          const dDate = new Date(d.donationDate);
          return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
        });
        setMonthlyGiving(thisMonthDonations.reduce((sum: number, d: any) => sum + d.amount, 0));

        setTotalEvents(eventsRes.data.length);
        setActiveGroups(groupsRes.data.length);

        // Chart Data Calculation
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(currentMonth - 5);
        sixMonthsAgo.setDate(1); 
        
        const monthlyData = new Map();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(currentMonth - i);
            const monthStr = d.toLocaleString('default', { month: 'short' });
            monthlyData.set(monthStr, 0);
        }

        donations.forEach((d: any) => {
            const dDate = new Date(d.donationDate);
            if (dDate >= sixMonthsAgo) {
                const monthStr = dDate.toLocaleString('default', { month: 'short' });
                if (monthlyData.has(monthStr)) {
                    monthlyData.set(monthStr, monthlyData.get(monthStr) + d.amount);
                }
            }
        });
        
        const chart = Array.from(monthlyData, ([month, amount]) => ({ month, amount }));
        const maxAmount = Math.max(...chart.map(c => c.amount), 1); 
        setChartData(chart.map(c => ({...c, height: `${(c.amount / maxAmount) * 100}%` })));

        // Recent Activity
        const recentActivities: any[] = [];
        donations.forEach((d: any) => {
            recentActivities.push({
                id: `d-${d.id}`,
                type: 'donation',
                date: new Date(d.donationDate),
                title: 'Donation Received',
                desc: `$${d.amount} to ${d.fund}`
            });
        });
        eventsRes.data.forEach((e: any) => {
            recentActivities.push({
                id: `e-${e.id}`,
                type: 'event',
                date: new Date(e.startTime),
                title: 'Upcoming Event',
                desc: e.title
            });
        });
        recentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
        setActivities(recentActivities.slice(0, 5));

      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const stats = [
    { label: 'Total Members', value: loading ? '...' : totalMembers.toLocaleString(), icon: Users, change: '+12.5%', trend: 'up', color: 'primary' },
    { label: 'Monthly Giving', value: loading ? '...' : `$${monthlyGiving.toLocaleString()}`, icon: DollarSign, change: '+8.2%', trend: 'up', color: 'secondary' },
    { label: 'Upcoming Events', value: loading ? '...' : totalEvents.toString(), icon: Calendar, change: '+3', trend: 'up', color: 'accent' },
    { label: 'Active Groups', value: loading ? '...' : activeGroups.toString(), icon: Activity, change: '0', trend: 'neutral', color: 'zinc' },
  ];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Admin <span className="text-gradient">Insights</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Hello {user?.email?.split('@')[0]}, here is a summary of your community.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/members')}
            className="flex items-center px-5 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all active:scale-95">
            View Members
          </button>
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center px-5 py-3 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-600/20 font-bold hover:bg-primary-500 transition-all active:scale-95">
            <Plus className="w-5 h-5 mr-2" /> New Event
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={item}
            className="glass-card group p-6 border border-white/40 dark:border-zinc-800/50"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-500/10 text-zinc-600'
              }`}>
                {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tight">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Giving Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-3xl p-8 border border-white/40 dark:border-zinc-800/50 flex flex-col h-[450px]"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Financial Giving Trend</h3>
              <p className="text-sm text-zinc-500 font-medium">Monthly oversight of church contributions</p>
            </div>
            <button 
              onClick={() => navigate('/donations')}
              className="p-2 text-zinc-400 hover:text-primary-500 transition-colors"
            >
              <ArrowUpRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 px-2">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                <div className="relative w-full flex flex-col items-center group-hover:z-10">
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none whitespace-nowrap">
                    ${data.amount.toLocaleString()}
                  </div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: data.height }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "circOut" }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-2xl shadow-lg shadow-primary-500/10 group-hover:from-primary-500 group-hover:to-primary-300 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-4 group-hover:text-primary-500 transition-colors">{data.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl p-8 border border-white/40 dark:border-zinc-800/50 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Pulse Activity</h3>
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <Clock className="w-5 h-5 text-zinc-500" />
            </div>
          </div>
          
          <div className="space-y-6 flex-1">
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={activity.id} className="flex group">
                <div className="mr-4 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                    activity.type === 'donation' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary-500/10 text-primary-600'
                  }`}>
                    {activity.type === 'donation' ? <DollarSign className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                  </div>
                  {i !== activities.length - 1 && (
                    <div className="w-px h-full bg-zinc-100 dark:bg-zinc-800/50 my-2"></div>
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-none mb-1">
                    {activity.title}
                  </p>
                  <p className="text-xs text-zinc-500 font-medium mb-1 leading-tight">{activity.desc}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Clock className="w-12 h-12 mb-2" />
                <p className="font-bold">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
