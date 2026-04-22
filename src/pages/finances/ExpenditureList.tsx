import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Receipt, DollarSign, Plus, X, Loader2, Calendar, Tag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function ExpenditureList() {
  const [expenditures, setExpenditures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Utility',
    date: new Date().toISOString().split('T')[0]
  });

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  });

  const fetchExpenditures = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/expenditures');
      setExpenditures(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch expenditures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenditures();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: 'Utility',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/expenditures', {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      });
      setIsModalOpen(false);
      fetchExpenditures();
      toast.success('Expenditure logged successfully');
    } catch (error) {
      console.error('Failed to log expenditure', error);
      toast.error('Failed to log expenditure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/expenditures/${confirmDelete.id}`);
      toast.success('Expenditure deleted');
      fetchExpenditures();
    } catch (error) {
      toast.error('Failed to delete expenditure');
    }
  };

  const totalExpenditure = expenditures.reduce((sum, e) => sum + Number(e.amount), 0);

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
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">Church <span className="text-rose-500">Expenditure</span></h1>
          <p className="text-zinc-500 font-medium tracking-tight">Manage and track church spending across various categories.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAdd} 
          className="px-6 py-3 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-500 transition-all font-bold flex items-center group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> Log Expenditure
        </motion.button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <motion.div variants={item} className="glass-card p-10 flex flex-col items-center text-center border border-white/40 dark:border-zinc-800/50">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6 shadow-inner">
            <DollarSign className="w-8 h-8" />
          </div>
          <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Total Spending</p>
          <h3 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">GHS{totalExpenditure.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mr-4">
               <Receipt className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Spending Records</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Title</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-400 font-bold">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-rose-500" />
                    Fetching records...
                  </td>
                </tr>
              ) : expenditures.length > 0 ? expenditures.map(e => (
                <tr key={e.id} className="group hover:bg-rose-50/30 dark:hover:bg-rose-500/5 transition-all duration-300">
                  <td className="px-8 py-5 text-sm font-bold text-zinc-500 dark:text-zinc-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 opacity-40" />
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 font-black text-zinc-900 dark:text-zinc-50">{e.title}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-tighter rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-rose-600 tracking-tight text-lg">
                    GHS{Number(e.amount).toFixed(2)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(e.id)}
                      className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-zinc-400 font-bold">No expenditures recorded.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Log Expenditure Modal */}
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
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Log <span className="text-rose-500">Expenditure</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Title</label>
                  <input required type="text" placeholder="e.g. Utility Bill" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Amount (GHS)</label>
                    <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Date</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all appearance-none"
                  >
                    <option value="Utility">Utility</option>
                    <option value="Salary">Salary</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Charity">Charity</option>
                    <option value="Event">Event</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-6 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:text-zinc-900 transition-colors">
                    Cancel
                  </button>
                  <button disabled={isSubmitting} type="submit" className="px-10 py-3 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-500/20 hover:bg-rose-500 transition-all flex items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Expenditure'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Delete Record"
        message="Are you sure you want to delete this expenditure record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        confirmText="Delete Record"
      />
    </div>
  );
}
