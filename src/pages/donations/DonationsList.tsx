import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Heart, DollarSign, Download, Plus, X, Loader2, Calendar, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonationsList() {
  const [donations, setDonations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    fund: 'General Fund',
    paymentMethod: 'Credit Card',
    transactionId: '',
    donationDate: new Date().toISOString().split('T')[0],
    memberId: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [donationsRes, membersRes] = await Promise.all([
        api.get('/donations'),
        api.get('/members')
      ]);
      setDonations(donationsRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      amount: '',
      fund: 'General Fund',
      paymentMethod: 'Credit Card',
      transactionId: '',
      donationDate: new Date().toISOString().split('T')[0],
      memberId: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/donations', {
        amount: parseFloat(formData.amount),
        fund: formData.fund,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        donationDate: new Date(formData.donationDate).toISOString(),
        memberId: formData.memberId ? parseInt(formData.memberId) : null
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to log donation', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ytdGiving = donations
    .filter(d => new Date(d.donationDate).getFullYear() === new Date().getFullYear())
    .reduce((sum, d) => sum + d.amount, 0);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">Financials & <span className="text-gradient">Giving</span></h1>
          <p className="text-zinc-500 font-medium tracking-tight">Track stewardship, tithes, and special ministry funds.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center group shadow-sm">
            <Download className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" /> Export
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd} 
            className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all font-bold flex items-center justify-center group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> Log Giving
          </motion.button>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <motion.div variants={item} className="glass-card p-10 flex flex-col items-center text-center border border-white/40 dark:border-zinc-800/50">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 shadow-inner">
            <DollarSign className="w-8 h-8" />
          </div>
          <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Total YTD Giving</p>
          <h3 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">${ytdGiving.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={item}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden border border-white/40 dark:border-zinc-800/50"
      >
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center mr-4">
               <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Recent Contributions</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Donor</th>
                <th className="px-8 py-5">Fund</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-400 font-bold">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
                    Fetching data...
                  </td>
                </tr>
              ) : donations.length > 0 ? donations.map(d => (
                <tr key={d.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all duration-300">
                  <td className="px-8 py-5 text-sm font-bold text-zinc-500 dark:text-zinc-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 opacity-40" />
                    {new Date(d.donationDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 font-black text-zinc-900 dark:text-zinc-50">{d.memberName || 'Anonymous'}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-tighter rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                      {d.fund}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-emerald-600 tracking-tight text-lg">
                    ${Number(d.amount).toFixed(2)}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 mr-2 opacity-40 text-emerald-500" />
                      {d.paymentMethod}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-zinc-400 font-bold">No contributions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Log Donation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-10 rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Log <span className="text-emerald-500">Giving</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Amount ($)</label>
                    <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Date</label>
                    <input required type="date" value={formData.donationDate} onChange={e => setFormData({...formData, donationDate: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Member (Optional)</label>
                  <select value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})}
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Anonymous</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Fund</label>
                    <select value={formData.fund} onChange={e => setFormData({...formData, fund: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option value="General Fund">General Fund</option>
                      <option value="Missions">Missions</option>
                      <option value="Building Fund">Building Fund</option>
                      <option value="Youth Ministry">Youth Ministry</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Method</label>
                    <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Transaction ID (Optional)</label>
                  <input type="text" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})}
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="pt-6 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:text-zinc-900 transition-colors">
                    Cancel
                  </button>
                  <button disabled={isSubmitting} type="submit" className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Giving'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
