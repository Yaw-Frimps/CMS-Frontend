import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Heart, DollarSign, Download, Plus, X, Loader2 } from 'lucide-react';

export default function DonationsList() {
  const [donations, setDonations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
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
      alert('Failed to log donation. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate YTD Giving
  const ytdGiving = donations
    .filter(d => new Date(d.donationDate).getFullYear() === new Date().getFullYear())
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financials & Giving</h1>
          <p className="text-gray-500">Track and manage tithes, offerings, and special fund campaigns.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium flex items-center">
            <Download className="w-5 h-5 mr-2" /> Export Report
          </button>
          <button onClick={handleOpenAdd} className="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition font-medium flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Log Donation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl flex items-center">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total YTD Giving</p>
            <h3 className="text-2xl font-bold text-gray-900">${ytdGiving.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-white/50 font-semibold text-lg text-gray-800 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-rose-500" /> Recent Contributions
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-sm tracking-wider">
              <th className="p-4 font-medium border-b border-gray-100">Date</th>
              <th className="p-4 font-medium border-b border-gray-100">Donor</th>
              <th className="p-4 font-medium border-b border-gray-100">Fund</th>
              <th className="p-4 font-medium border-b border-gray-100">Amount</th>
              <th className="p-4 font-medium border-b border-gray-100">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/40">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-green-500" />
                  Loading donations...
                </td>
              </tr>
            ) : donations.length > 0 ? donations.map(d => (
              <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-4 text-sm text-gray-600">{new Date(d.donationDate).toLocaleDateString()}</td>
                <td className="p-4 font-medium text-gray-900">{d.memberName || 'Anonymous'}</td>
                <td className="p-4 text-sm text-gray-600"><span className="px-2 py-1 bg-gray-100 rounded-md">{d.fund}</span></td>
                <td className="p-4 font-bold text-green-600">${Number(d.amount).toFixed(2)}</td>
                <td className="p-4 text-sm text-gray-500">{d.paymentMethod}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No donations recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Donation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Log Donation</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    required 
                    type="date" 
                    value={formData.donationDate} 
                    onChange={e => setFormData({...formData, donationDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member (Optional)</label>
                <select 
                  value={formData.memberId} 
                  onChange={e => setFormData({...formData, memberId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                >
                  <option value="">-- Anonymous / Select Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName} (ID: #{m.id})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fund</label>
                  <select 
                    value={formData.fund} 
                    onChange={e => setFormData({...formData, fund: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="General Fund">General Fund</option>
                    <option value="Missions">Missions</option>
                    <option value="Building Fund">Building Fund</option>
                    <option value="Youth Ministry">Youth Ministry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select 
                    value={formData.paymentMethod} 
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (Optional)</label>
                <input 
                  type="text" 
                  value={formData.transactionId} 
                  onChange={e => setFormData({...formData, transactionId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Log Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
