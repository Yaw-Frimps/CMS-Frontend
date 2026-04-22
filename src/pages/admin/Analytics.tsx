import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight, Loader2, PieChart, DollarSign, BarChart3 } from 'lucide-react';
import { attendanceService, type MeetingAttendance } from '../../services/attendance';
import { api } from '../../services/api';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MeetingAttendance[]>([]);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [stats, setStats] = useState({
    current: 0,
    previous: 0,
    growth: 0,
    average: 0,
    peak: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [records, financeRes] = await Promise.all([
        attendanceService.getAttendances(),
        api.get('/analytics/finance-summary')
      ]);
      
      setFinancialSummary(financeRes.data);
      
      // Ensure data is sorted by date for the chart
      const sortedData = [...records].sort((a, b) => 
        new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime()
      );
      setData(sortedData);

      if (sortedData.length > 0) {
        const last = sortedData[sortedData.length - 1].attendeeCount;
        const prev = sortedData.length > 1 ? sortedData[sortedData.length - 2].attendeeCount : 0;
        const avg = sortedData.reduce((acc, curr) => acc + curr.attendeeCount, 0) / sortedData.length;
        const peak = Math.max(...sortedData.map(d => d.attendeeCount));
        const growth = prev > 0 ? ((last - prev) / prev) * 100 : 0;

        setStats({
          current: last,
          previous: prev,
          growth,
          average: Math.round(avg),
          peak
        });
      }
    } catch (error) {
      console.error('Failed to load analytics data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-medium animate-pulse">Analyzing congregation data...</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {new Date(label).toLocaleDateString(undefined, { dateStyle: 'full' })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {entry.name}: <span className="text-zinc-900 dark:text-zinc-100">{entry.value.toLocaleString()}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Section */}
      <div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black font-headline text-zinc-900 dark:text-white tracking-tight">
            Analytics & <span className="text-primary-600 dark:text-primary-400">Reports</span>
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg font-medium">
            Visual insights into church growth and engagement trends.
          </p>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Latest Attendance', value: stats.current, icon: Users, color: 'primary', trend: stats.growth },
          { label: 'Average Attendance', value: stats.average, icon: TrendingUp, color: 'emerald' },
          { label: 'Peak Attendance', value: stats.peak, icon: AreaChart, color: 'amber' },
          { label: 'Meetings Recorded', value: data.length, icon: Calendar, color: 'blue' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none group hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend !== undefined && stat.trend !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(stat.trend).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {stat.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Financial Summary */}
      {financialSummary && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            Financial Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-10 border border-white/40 dark:border-zinc-800/50 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-24 h-24 text-emerald-500" />
              </div>
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-2">Total Income</p>
              <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">GH₵{financialSummary.totalDonations.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Tithes, Offertory & Seeds
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10 border border-white/40 dark:border-zinc-800/50 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <ArrowDownRight className="w-24 h-24 text-rose-500" />
              </div>
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-2">Total Expenditures</p>
              <h3 className="text-4xl font-black text-rose-600 tracking-tighter">GH₵{financialSummary.totalExpenditures.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                Church Expenses & Maintenance
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-10 border border-zinc-200 dark:border-primary-500/30 bg-primary-500/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-24 h-24 text-primary-500" />
              </div>
              <p className="text-sm font-black text-primary-500 uppercase tracking-widest mb-2">Net Revenue</p>
              <h3 className={`text-4xl font-black tracking-tighter ${financialSummary.netRevenue >= 0 ? 'text-primary-600' : 'text-rose-600'}`}>
                GH₵{financialSummary.netRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-400">
                <div className={`w-2 h-2 rounded-full ${financialSummary.netRevenue >= 0 ? 'bg-primary-500' : 'bg-rose-500'}`} />
                Closing Balance
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Trend Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Attendance Trend</h3>
              <p className="text-sm font-medium text-zinc-500">Congregation growth over time</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="meetingDate" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="attendeeCount" 
                  name="Attendance"
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAttendance)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Meeting Comparison */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Meeting Comparison</h3>
              <p className="text-sm font-medium text-zinc-500">Attendance by meeting type</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(-5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="meetingName" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="attendeeCount" 
                  name="Attendance"
                  radius={[12, 12, 0, 0]}
                  barSize={40}
                  animationDuration={1500}
                >
                  {data.slice(-5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Financial Comparison Chart */}
      {financialSummary?.yearlyBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Annual Financial Performance</h3>
              <p className="text-sm font-medium text-zinc-500">Yearly comparison of income and expenditures</p>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={Object.entries(financialSummary.yearlyBreakdown).map(([year, values]: [string, any]) => ({
                  year,
                  income: values.income || 0,
                  expense: values.expense || 0,
                  net: (values.income || 0) - (values.expense || 0)
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl">
                          <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-3">{label} Summary</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-xs font-bold text-zinc-400">Total Income:</span>
                              <span className="text-sm font-black text-emerald-600">GH₵{payload[0].value.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-xs font-bold text-zinc-400">Total Expense:</span>
                              <span className="text-sm font-black text-rose-600">GH₵{payload[1].value.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-xs font-bold text-zinc-400">Net Revenue:</span>
                              <span className={`text-sm font-black ${payload[2].value >= 0 ? 'text-primary-600' : 'text-rose-600'}`}>
                                GH₵{payload[2].value.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="net" name="Net Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
