import { useState, useEffect } from 'react';
import { Activity, Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

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
        // Fetch Members
        const membersRes = await api.get('/members');
        setTotalMembers(membersRes.data.length);

        // Fetch Donations
        const donationsRes = await api.get('/donations');
        const donations = donationsRes.data;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthDonations = donations.filter((d: any) => {
          const dDate = new Date(d.donationDate);
          return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
        });
        const total = thisMonthDonations.reduce((sum: number, d: any) => sum + d.amount, 0);
        setMonthlyGiving(total);

        // Fetch Events
        const eventsRes = await api.get('/events');
        setTotalEvents(eventsRes.data.length);

        // Fetch Groups
        const groupsRes = await api.get('/groups');
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

        // Recent Activity Calculation
        const recentActivities: any[] = [];
        donations.forEach((d: any) => {
            recentActivities.push({
                id: `d-${d.id}`,
                type: 'donation',
                date: new Date(d.donationDate),
                title: 'New donation received',
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
    { label: 'Total Members', value: loading ? '...' : totalMembers.toString(), icon: Users, change: '+12%', changeType: 'positive', color: 'bg-blue-500' },
    { label: 'Monthly Giving', value: loading ? '...' : `$${monthlyGiving.toFixed(2)}`, icon: DollarSign, change: '+8%', changeType: 'positive', color: 'bg-primary-500' },
    { label: 'Total Events', value: loading ? '...' : totalEvents.toString(), icon: Activity, change: '+1', changeType: 'positive', color: 'bg-purple-500' },
    { label: 'Active Groups', value: loading ? '...' : activeGroups.toString(), icon: Calendar, change: '0', changeType: 'neutral', color: 'bg-secondary-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Welcome back, {user?.email} 👋 Here's what's happening today.</p>
        </div>
        <button 
          onClick={() => navigate('/members')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition font-medium flex items-center">
          + Quick Action
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl transform transition-transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 transition-colors duration-300`}>
                <stat.icon className={`w-6 h-6 text-opacity-100 ${stat.color.replace('bg-', 'text-')} dark:text-opacity-80`} />
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full transition-colors duration-300 ${
                stat.changeType === 'positive' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                stat.changeType === 'negative' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1 transition-colors duration-300">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-6 rounded-2xl min-h-[400px] transition-colors duration-300 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">Giving Trend</h3>
            <button onClick={() => navigate('/donations')} className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-300">
              View Report <TrendingUp className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="flex-1 w-full bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-end justify-around pb-4 pt-8 px-4 transition-colors duration-300">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center w-8 h-full justify-end group mt-auto">
                <div 
                  className="w-full bg-primary-500/80 rounded-t-sm transition-all duration-1000 ease-in-out hover:bg-primary-400 hover:opacity-100"
                  style={{ height: data.height || '0%', minHeight: '4px' }}
                  title={`$${data.amount.toFixed(2)}`}
                ></div>
                <span className="text-xs text-gray-500 mt-2 font-medium">{data.month}</span>
              </div>
            ))}
            {chartData.length === 0 && !loading && (
              <p className="text-gray-400 font-medium my-auto max-h-min flex items-center">No data available</p>
            )}
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl min-h-[400px] transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 transition-colors duration-300">Recent Activity</h3>
          <div className="space-y-6">
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={activity.id} className="flex relative group">
                {i !== activities.length - 1 && <div className="absolute top-8 bottom-[-24px] left-4 w-px bg-gray-200 dark:bg-gray-700 z-0 transition-colors duration-300"></div>}
                <div className="relative z-10 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mr-4 border border-primary-200 dark:border-primary-800/50 transition-colors duration-300">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${activity.type === 'donation' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">{activity.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{activity.desc} • {activity.date.toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
