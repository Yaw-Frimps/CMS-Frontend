import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Search, Plus, X, Loader2, Trash2, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function GroupsList() {
  const { user, isAdmin } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meetingSchedule: '',
    category: 'General'
  });

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/groups');
      setGroups(res.data);
      
      if (user?.memberId) {
        const myGroupsRes = await api.get(`/members/${user.memberId}/groups`);
        setMyGroupIds(myGroupsRes.data.map((g: any) => g.id));
      }
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
    setFormData({
      name: '',
      description: '',
      meetingSchedule: '',
      category: 'General'
    });
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

  const handleJoin = async (id: number) => {
    if (!user?.memberId) return;
    try {
      await api.post(`/groups/${id}/members/${user.memberId}`);
      fetchGroups();
    } catch (error) {
      console.error('Failed to join group', error);
      alert('Failed to join group.');
    }
  };

  const handleLeave = async (id: number) => {
    if (!user?.memberId) return;
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await api.delete(`/groups/${id}/members/${user.memberId}`);
        fetchGroups();
      } catch (error) {
        console.error('Failed to leave group', error);
        alert('Failed to leave group.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/groups', formData);
      setIsModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Failed to create group', error);
      alert('Failed to create group. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups & Ministries</h1>
          <p className="text-gray-500">Manage small groups, serving teams, and connect groups.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition font-medium flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Create Group
          </button>
        )}
      </div>

      <div className="glass rounded-2xl overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100 flex items-center bg-white/50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search groups..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : groups.filter(g => {
          const q = searchQuery.toLowerCase();
          return !q || g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q);
        }).length > 0 ? groups.filter(g => {
          const q = searchQuery.toLowerCase();
          return !q || g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q);
        }).map(group => (
          <div key={group.id} className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 border-t-4 border-secondary-500 flex flex-col relative">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                {group.category || 'General'}
              </span>
              {isAdmin && (
                <button onClick={() => handleDelete(group.id)} className="text-red-400 hover:text-red-600 transition" aria-label="Delete group">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
            
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{group.description}</p>
            
            <p className="text-gray-500 text-sm mb-6 flex items-center">
              <Users className="w-4 h-4 mr-1.5" /> {group.memberCount || 0} Members
            </p>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
              <p className="text-sm font-medium text-gray-600">{group.meetingSchedule}</p>
              {!isAdmin && (
                <>
                  {myGroupIds.includes(group.id) ? (
                    <button 
                      onClick={() => handleLeave(group.id)} 
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors flex items-center"
                      aria-label="Leave group"
                    >
                      <LogOut className="w-3 h-3 mr-1" /> Leave
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoin(group.id)} 
                      className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors flex items-center"
                      aria-label="Join group"
                    >
                      <LogIn className="w-3 h-3 mr-1" /> Join
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full glass p-12 text-center rounded-2xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Groups Found</h3>
            <p className="text-gray-500 max-w-sm">Get started by creating a new small group or ministry.</p>
          </div>
        )}
      </div>

      {/* Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. Youth Ministry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Schedule</label>
                <input 
                  required 
                  type="text" 
                  value={formData.meetingSchedule} 
                  onChange={e => setFormData({...formData, meetingSchedule: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. Fridays at 7 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  required 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="General">General</option>
                  <option value="Small Group">Small Group</option>
                  <option value="Serve Team">Serve Team</option>
                  <option value="Ministry">Ministry</option>
                  <option value="Support Link">Support Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder="Brief description of the group's purpose"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium transition-colors flex items-center">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
