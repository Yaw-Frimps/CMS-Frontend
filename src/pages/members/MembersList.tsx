import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Phone, X, Loader2, User as UserIcon, MapPin, Calendar, Mail, Layers, ChevronRight, ArrowUpDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MembersList() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: 'firstName', direction: 'asc' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
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

  const handleOpenEdit = (e: React.MouseEvent, member: any) => {
    e.stopPropagation();
    setEditingMember(member);
    setFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      phone: member.phone || '',
      address: member.address || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (member: any) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredMembers = members.filter(m => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const email = (m.email || '').toLowerCase();
    const groups = (m.groupNames || []).join(' ').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query) || groups.includes(query);
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortConfig.key) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
        break;
      case 'date':
        aValue = a.accountCreatedAt || a.joinedDate || '';
        bValue = b.accountCreatedAt || b.joinedDate || '';
        break;
      case 'groups':
        aValue = (a.groupNames || []).join(', ');
        bValue = (b.groupNames || []).join(', ');
        break;
      default:
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

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
              placeholder="Search by name, email or group..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
            {sortedMembers.length} Members total
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 text-[10px] font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-8 py-5 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Name & ID <ArrowUpDown className="w-4 h-4 ml-2" />
                  </div>
                </th>
                <th className="px-8 py-5">Contact Info</th>
                <th className="px-8 py-5 hidden md:table-cell cursor-pointer hover:text-primary-600 transition-colors" onClick={() => handleSort('date')}>
                  <div className="flex items-center">
                    Account Created <ArrowUpDown className="w-4 h-4 ml-2" />
                  </div>
                </th>
                <th className="px-8 py-5 hidden md:table-cell cursor-pointer hover:text-primary-600 transition-colors" onClick={() => handleSort('groups')}>
                  <div className="flex items-center">
                    Groups <ArrowUpDown className="w-4 h-4 ml-2" />
                  </div>
                </th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary-500" />
                    <p className="text-zinc-500 font-bold">Accessing directory...</p>
                  </td>
                </tr>
              ) : sortedMembers.length > 0 ? sortedMembers.map(member => (
                <tr 
                  key={member.id} 
                  onClick={() => handleOpenDetail(member)}
                  className="group cursor-pointer hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-all duration-300 border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-black flex items-center justify-center mr-4 shadow-lg shadow-primary-500/20 uppercase text-lg group-hover:scale-105 transition-transform">
                        {(member.firstName?.[0] || '')}{(member.lastName?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-black text-zinc-900 dark:text-zinc-50 text-lg leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-zinc-400 font-bold mt-1 tracking-wider uppercase flex items-center">
                          <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded mr-1.5">ID #{member.id}</span>
                          {member.userId && <span className="text-[9px] text-green-500 flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" /> ACTIVE ACCOUNT</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col space-y-2">
                      <span className="flex items-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        <Phone className="w-4 h-4 mr-3 text-primary-500" /> {member.phone || 'N/A'}
                      </span>
                      <span className="flex items-center text-sm font-bold text-zinc-500 dark:text-zinc-100">
                        <Mail className="w-4 h-4 mr-3 text-primary-500" /> {member.email || 'No Email'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell">
                    <div className="flex items-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                      <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                      {member.accountCreatedAt ? new Date(member.accountCreatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No Account'}
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {member.groupNames && member.groupNames.length > 0 ? member.groupNames.slice(0, 2).map((g: string) => (
                        <span key={g} className="px-2 py-1 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-[10px] font-black uppercase tracking-tight whitespace-nowrap">
                          {g}
                        </span>
                      )) : <span className="text-zinc-400 italic text-xs">Unassigned</span>}
                      {member.groupNames?.length > 2 && <span className="text-[10px] font-black text-zinc-400">+{member.groupNames.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={(e) => handleOpenEdit(e, member)} 
                        className="p-3 rounded-xl bg-white/50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm border border-zinc-100 dark:border-zinc-700 group/btn" 
                        title="Edit Member"
                      >
                        <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, member.id)} 
                        className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn" 
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                      <UserIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-2">No matching members</h3>
                    <p className="text-zinc-500 font-medium">Try refining your search or add a new congregant.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="glass p-0 rounded-[3rem] w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-12 text-white relative">
                <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-8 right-8 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-8">
                  <div className="w-32 h-32 rounded-[2rem] bg-white text-primary-600 text-5xl font-black flex items-center justify-center shadow-2xl uppercase">
                    {(selectedMember.firstName?.[0] || '')}{(selectedMember.lastName?.[0] || '')}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">{selectedMember.firstName} {selectedMember.lastName}</h2>
                    <p className="text-white/70 font-bold uppercase tracking-widest text-sm mt-2 flex items-center">
                      <span className="bg-white/10 px-3 py-1 rounded-full mr-3">Member #{selectedMember.id}</span>
                      {selectedMember.userId ? 'Account Verified' : 'No Online Account'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-12 space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contact Details</label>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center"><Phone className="w-4 h-4 mr-3 text-primary-500" /> {selectedMember.phone || 'N/A'}</p>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center mt-2"><Mail className="w-4 h-4 mr-3 text-primary-500" /> {selectedMember.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Address</label>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50 flex items-start"><MapPin className="w-4 h-4 mr-3 text-primary-500 mt-1 shrink-0" /> {selectedMember.address || 'Anonymous'}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account History</label>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center"><Calendar className="w-4 h-4 mr-3 text-primary-500" /> Member Since: {selectedMember.joinedDate ? new Date(selectedMember.joinedDate).toLocaleDateString() : '---'}</p>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center mt-2"><Info className="w-4 h-4 mr-3 text-primary-500" /> Created: {selectedMember.accountCreatedAt ? new Date(selectedMember.accountCreatedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Group Affiliations</label>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedMember.groupNames && selectedMember.groupNames.length > 0 ? selectedMember.groupNames.map((g: string) => (
                          <span key={g} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-black uppercase tracking-tight flex items-center">
                            <Layers className="w-3 h-3 mr-2" /> {g}
                          </span>
                        )) : <p className="text-zinc-400 italic text-sm font-medium">No assigned groups</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                   <button 
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-10 py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-2xl font-black shadow-xl hover:-translate-y-1 transition-all"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit/Add Modal */}
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
