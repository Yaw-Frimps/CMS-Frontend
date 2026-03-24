import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Phone, X, Loader2 } from 'lucide-react';

export default function MembersList() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
      alert('Failed to save member. See console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Directory</h1>
          <p className="text-gray-500">Manage church congregants, families, and contact info.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition font-medium flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Member
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden relative">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium border-b border-gray-100">Name</th>
              <th className="p-4 font-medium border-b border-gray-100">Contact</th>
              <th className="p-4 font-medium border-b border-gray-100 hidden md:table-cell">Joined</th>
              <th className="p-4 font-medium border-b border-gray-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/40">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                  Loading members...
                </td>
              </tr>
            ) : members.length > 0 ? members.map(member => (
              <tr key={member.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center mr-3 uppercase">
                      {(member.firstName?.[0] || '')}{(member.lastName?.[0] || '')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-gray-500">ID: #{member.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col space-y-1">
                    <span className="flex items-center text-sm text-gray-600"><Phone className="w-3 h-3 mr-2" /> {member.phone || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-sm text-gray-600">
                  {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenEdit(member)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" aria-label="Edit member"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" aria-label="Delete member"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{editingMember ? 'Edit Member' : 'Add Member'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium transition-colors flex items-center">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
