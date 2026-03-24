import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Phone, X, Loader2, User as UserIcon, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MembersList() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/members');
      setMembers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({ firstName: '', lastName: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      phone: member.phone || '',
      address: member.address || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.delete(`/members/${id}`);
        fetchMembers();
      } catch (error) {
        console.error('Failed to delete member', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, formData);
      } else {
        await api.post('/members', formData);
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (error) {
      console.error('Failed to save member', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">Member <span className="text-gradient">Directory</span></h1>
          <p className="text-zinc-500 font-medium tracking-tight">Connect with the congregation and manage ministry relationships.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all font-bold flex items-center group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> Add Member
        </motion.button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden border border-white/40 dark:border-zinc-800/50"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-50/30 dark:bg-zinc-900/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            {filteredMembers.length} Members total
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5">Name & ID</th>
                <th className="px-8 py-5">Contact Info</th>
                <th className="px-8 py-5 hidden md:table-cell">Joined Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={container}
              initial="hidden"
              animate="show"
              className="divide-y divide-zinc-100 dark:divide-zinc-800"
            >
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary-500" />
                    <p className="text-zinc-500 font-bold">Accessing directory...</p>
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? filteredMembers.map(member => (
                <motion.tr variants={item} key={member.id} className="group hover:bg-primary-50/30 dark:hover:bg-primary-500/5 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-black flex items-center justify-center mr-4 shadow-lg shadow-primary-500/20 uppercase text-lg">
                        {(member.firstName?.[0] || '')}{(member.lastName?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-black text-zinc-900 dark:text-zinc-50 text-lg leading-tight">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-zinc-400 font-bold mt-1 tracking-wider uppercase">ID #{member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col space-y-2">
                      <span className="flex items-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                        <Phone className="w-4 h-4 mr-3 text-primary-500" /> {member.phone || 'N/A'}
                      </span>
                      <span className="flex items-center text-sm font-medium text-zinc-400 dark:text-zinc-500">
                        <MapPin className="w-4 h-4 mr-3" /> {member.address || 'Anonymous'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell">
                    <div className="flex items-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                      <Calendar className="w-4 h-4 mr-2 opacity-40" />
                      {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '---'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleOpenEdit(member)} 
                        className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm group/btn" 
                        title="Edit Member"
                      >
                        <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => handleDelete(member.id)} 
                        className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn" 
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                      <UserIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-2">No matching members</h3>
                    <p className="text-zinc-500 font-medium">Try refining your search or add a new congregant.</p>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Member Modal */}
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
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {editingMember ? 'Edit' : 'Add'} <span className="text-primary-600">Member</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">First Name</label>
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Last Name</label>
                    <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000"
                      className="w-full pl-12 pr-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Physical Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="City, State, Country"
                      className="w-full pl-12 pr-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:text-zinc-900 transition-colors">
                    Cancel
                  </button>
                  <button disabled={isSubmitting} type="submit" className="px-10 py-3 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all flex items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingMember ? 'Save Changes' : 'Register Member')}
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
