import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Users, X, Loader2, Layers, Clock, LogIn, LogOut, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../../components/common/ImageUpload';

export default function GroupsList() {
  const { isAdmin, user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meetingSchedule: '',
    category: 'General',
    imageUrl: ''
  });
  const [selectedGroupImage, setSelectedGroupImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/groups');
      const processedGroups = res.data.map((g: any) => ({
        ...g,
        isJoined: g.memberIds?.includes(user?.memberId)
      }));
      setGroups(processedGroups);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setFormData({ name: '', description: '', meetingSchedule: '', category: 'General', imageUrl: '' });
    setSelectedGroupImage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: any) => {
    setEditingGroup(group);
    setFormData({
      name: group.name || '',
      description: group.description || '',
      meetingSchedule: group.meetingSchedule || '',
      category: group.category || 'General',
      imageUrl: group.imageUrl || ''
    });
    setSelectedGroupImage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await api.delete(`/groups/${id}`);
        fetchGroups();
      } catch (error) {
        console.error('Failed to delete group', error);
      }
    }
  };

  const handleJoinLeave = async (groupId: number, isJoining: boolean) => {
    if (!user?.memberId) return;
    try {
      if (isJoining) {
        await api.post(`/groups/${groupId}/members/${user.memberId}`);
      } else {
        await api.delete(`/groups/${groupId}/members/${user.memberId}`);
      }
      fetchGroups();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let finalImageUrl = formData.imageUrl;
      
      if (selectedGroupImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', selectedGroupImage);
        const uploadRes = await api.post('/groups/upload-image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        finalImageUrl = uploadRes.data;
      }

      const payload = { ...formData, imageUrl: finalImageUrl };

      if (editingGroup) {
        await api.put(`/groups/${editingGroup.id}`, payload);
      } else {
        await api.post('/groups', payload);
      }
      setIsModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Failed to save group', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">Church <span className="text-gradient">Groups</span></h1>
          <p className="text-zinc-500 font-medium tracking-tight">
            {isAdmin ? 'Organize and manage ministry departments and small groups.' : 'Discover and join ministry teams and small groups.'}
          </p>
        </div>
        {isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all font-bold flex items-center group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> Create Group
          </motion.button>
        )}
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
              placeholder="Search groups..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
            {filteredGroups.length} Groups total
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary-500" />
              <p className="text-zinc-500 font-bold">Loading groups...</p>
            </div>
          ) : filteredGroups.length > 0 ? filteredGroups.map(group => (
            <motion.div 
              key={group.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] hover:shadow-2xl hover:shadow-primary-500/10 transition-all relative overflow-hidden flex flex-col"
            >
              {group.imageUrl ? (
                <div className="h-40 w-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent z-10" />
                  <img src={getImageUrl(group.imageUrl)!} alt={group.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-4 left-6 z-20">
                    <span className="px-3 py-1 bg-primary-500/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                      {group.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 relative overflow-hidden flex items-center justify-center">
                  <Layers className="w-12 h-12 text-zinc-300 dark:text-zinc-700 absolute opacity-50 -right-4 -bottom-4 rotate-12 scale-150" />
                  <span className="px-3 py-1 bg-zinc-400/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/5 absolute bottom-4 left-6">
                    {group.category}
                  </span>
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
              {isAdmin && (
                <div className="absolute top-0 right-0 p-6 flex gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                  <button 
                    onClick={() => handleOpenEdit(group)}
                    className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(group.id)}
                    className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                {!group.imageUrl && (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{group.name}</h3>
                </div>
              </div>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                {group.description || 'No description provided for this group.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                  <div className="flex items-center text-zinc-400 dark:text-zinc-500 mb-1">
                    <Users className="w-3.5 h-3.5 mr-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Members</span>
                  </div>
                  <p className="text-lg font-black text-zinc-900 dark:text-zinc-50">{group.memberCount}</p>
                </div>
                {!isAdmin && user?.memberId && (
                  <button
                    onClick={() => handleJoinLeave(group.id, !group.isJoined)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      group.isJoined 
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-600' 
                      : 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20 hover:scale-[1.02]'
                    }`}
                  >
                    {group.isJoined ? (
                      <>
                        <LogOut className="w-4 h-4 mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Leave</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Join</span>
                      </>
                    )}
                  </button>
                )}
                {isAdmin && (
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                    <div className="flex items-center text-zinc-400 dark:text-zinc-500 mb-1">
                      <Clock className="w-3.5 h-3.5 mr-2" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Schedule</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">{group.meetingSchedule || 'TBD'}</p>
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <Layers className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">No groups found</h3>
              <p className="text-zinc-500">Start by creating a new ministry or study group.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {editingGroup ? 'Update' : 'Create'} <span className="text-primary-600">Group</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" /> Group Cover Image
                  </label>
                  <ImageUpload 
                    onImageSelect={(file) => setSelectedGroupImage(file)} 
                    currentImageUrl={formData.imageUrl}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Group Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Youth Ministry"
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="General">General</option>
                      <option value="Ministry">Ministry</option>
                      <option value="Study">Study Group</option>
                      <option value="Community">Community</option>
                      <option value="Outreach">Outreach</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Meeting Schedule</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input type="text" value={formData.meetingSchedule} onChange={e => setFormData({...formData, meetingSchedule: e.target.value})}
                        placeholder="e.g., Sunday 10AM"
                        className="w-full pl-11 pr-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Briefly describe the purpose of this group..."
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium resize-none"
                  />
                </div>

                <div className="pt-6 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:text-zinc-900 transition-colors">
                    Cancel
                  </button>
                  <button disabled={isSubmitting} type="submit" className="px-10 py-3 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all flex items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingGroup ? 'Update Group' : 'Create Group')}
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
