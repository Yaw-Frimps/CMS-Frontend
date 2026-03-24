import { useState, useEffect } from 'react';
import { Heart, Calendar, Users, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

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
        // Fetch events
        const eventsRes = await api.get<EventDto[]>('/events');
        const events = eventsRes.data;
        const upcoming = events.filter(e => new Date(e.startTime) > new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        if (upcoming.length > 0) {
          setNextEvent(upcoming[0]);
        }

        // Fetch giving
        if (user?.memberId) {
          const givingRes = await api.get<DonationDto[]>(`/donations/member/${user.memberId}`);
          const donations = givingRes.data;
          
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const thisMonthDonations = donations.filter(d => {
            const dDate = new Date(d.donationDate);
            return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
          });
          
          const total = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);
          setMonthlyGiving(total);

          // Fetch attendance
          const attendanceRes = await api.get(`/attendance/member/${user.memberId}`);
          setAttendanceCount(attendanceRes.data.length);

          // Fetch groups
          const groupsRes = await api.get(`/members/${user.memberId}/groups`);
          setMyGroups(groupsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="p-8">
      {/* Welcome Banner */}
      <div className="glass rounded-2xl p-8 mb-8 bg-gradient-to-r from-primary-900 to-primary-700 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -m-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, {user?.email?.split('@')[0] || 'Friend'}!</h1>
          <p className="text-primary-100 max-w-xl text-lg">
            Welcome to your personal church portal. From here, you can manage your giving, register for events, and stay connected.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Next Event Card */}
        <div className="glass p-6 rounded-2xl flex flex-col group hover:shadow-xl transition-all duration-300 dark:hover:shadow-primary-900/10">
          <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">Upcoming Event</h3>
          {loading ? (
             <div className="flex-1 flex items-center mb-4 text-gray-400 dark:text-gray-500 transition-colors duration-300"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
          ) : nextEvent ? (
            <>
              <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">{nextEvent.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 transition-colors duration-300">
                {new Date(nextEvent.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                {' • '}
                {nextEvent.location}
              </p>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4 flex-1 transition-colors duration-300">No upcoming events found.</p>
          )}
          <button onClick={() => navigate('/events')} className="w-full mt-auto py-2 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 font-medium rounded-lg group-hover:bg-secondary-600 group-hover:text-white dark:group-hover:bg-secondary-600 dark:group-hover:text-white transition-colors">
            View Calendar
          </button>
        </div>

        {/* Giving Card */}
        <div className="glass p-6 rounded-2xl flex flex-col group hover:shadow-xl transition-all duration-300 dark:hover:shadow-green-900/10">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">My Giving</h3>
           {loading ? (
             <div className="mb-4 text-gray-400 dark:text-gray-500 flex items-center transition-colors duration-300"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
          ) : (
            <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">${monthlyGiving.toFixed(2)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">this month</span></p>
          )}
          <button onClick={() => navigate('/donations')} className="w-full mt-auto py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium rounded-lg group-hover:bg-green-600 group-hover:text-white dark:group-hover:bg-green-600 dark:group-hover:text-white transition-colors">
            Give Now
          </button>
        </div>

        {/* My Groups Card */}
        <div className="glass p-6 rounded-2xl flex flex-col group hover:shadow-xl transition-all duration-300 dark:hover:shadow-blue-900/10">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">My Groups</h3>
          {loading ? (
             <div className="flex-1 flex items-center mb-4 text-gray-400 dark:text-gray-500 transition-colors duration-300"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
          ) : myGroups.length > 0 ? (
            <div className="mb-4 flex-1">
              <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">{myGroups[0].name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{myGroups[0].category}</p>
              {myGroups.length > 1 && (
                <p className="text-xs text-blue-500 mt-1">+{myGroups.length - 1} more</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4 flex-1 transition-colors duration-300">You haven't joined any groups yet.</p>
          )}
          <button onClick={() => navigate('/groups')} className="w-full mt-auto py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium rounded-lg group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-colors">
            Find a Group
          </button>
        </div>

        {/* My Attendance Card */}
        <div className="glass p-6 rounded-2xl flex flex-col group hover:shadow-xl transition-all duration-300 dark:hover:shadow-purple-900/10">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">My Attendance</h3>
          {loading ? (
             <div className="mb-4 text-gray-400 dark:text-gray-500 flex items-center transition-colors duration-300"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
          ) : (
            <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">{attendanceCount} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">events attended</span></p>
          )}
          <button onClick={() => navigate('/events')} className="w-full mt-auto py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium rounded-lg group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-600 dark:group-hover:text-white transition-colors">
            View History
          </button>
        </div>

      </div>
    </div>
  );
}
