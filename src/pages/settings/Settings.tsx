import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, getImageUrl } from '../../services/api';
import { User, Lock, Shield, Mail, Loader2, X, Eye, EyeOff, Camera, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Change Password Modal ──────────────────────────────────────────────────────
function ChangePasswordModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await api.put(`/users/${userId}/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password updated!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed. Check current password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/20"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Security <span className="text-primary-600">Update</span></h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm font-bold border border-emerald-100 dark:border-emerald-900/30">
              ✓ {success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-200 dark:border-red-800">
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Current Password</label>
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} required value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="space-y-2">
              <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} required minLength={6} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required minLength={6} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border ${
                    passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                      ? 'border-red-400 focus:ring-red-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 focus:ring-primary-500/20'
                  } focus:border-primary-500 outline-none transition-all font-bold`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:text-zinc-900 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all flex items-center gap-2 disabled:opacity-50">
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
              Update Account
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Settings Page ──────────────────────────────────────────────────────────────
export default function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [profileData, setProfileData] = useState({ dateOfBirth: '', profileImageUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.memberId) { setLoading(false); return; }
      try {
        const res = await api.get(`/members/${user.memberId}`);
        setProfileData({
          dateOfBirth: res.data.dateOfBirth || '',
          profileImageUrl: res.data.profileImageUrl || '',
        });
        if (res.data.profileImageUrl) setImagePreview(res.data.profileImageUrl);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Select an image.'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId) return;
    try {
      setSaving(true);
      setSuccessMsg('');
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profileImage', selectedFile);
        if (profileData.dateOfBirth) formData.append('dateOfBirth', profileData.dateOfBirth);
        const response = await api.post(`/members/${user.memberId}/profile-image`, formData, { headers: { 'Content-Type': undefined } });
        const imageUrl = response.data.profileImageUrl || response.data.imageUrl || response.data.url;
        if (!imageUrl) throw new Error('No image URL returned');
        setProfileData((prev) => ({ ...prev, profileImageUrl: imageUrl }));
        setImagePreview(imageUrl);
        setSelectedFile(null);
        updateUser({ profileImageUrl: imageUrl });
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { profileImageUrl: imageUrl } }));
      } else {
        await api.put(`/members/${user.memberId}/profile`, { dateOfBirth: profileData.dateOfBirth });
      }
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      <AnimatePresence>
        {showPasswordModal && (
          <ChangePasswordModal userId={user?.id ?? 0} onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">Account <span className="text-gradient">Settings</span></h1>
        <p className="text-zinc-500 font-medium tracking-tight">Configure preferences, update security, and manage your church profile.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={item} className="glass-card p-10 border border-white/40 dark:border-zinc-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-bl-full -mr-10 -mt-10 blur-2xl" />
            
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-8 flex items-center">
              <User className="w-6 h-6 mr-3 text-primary-500" /> Personal Identity
            </h3>

            <div className="space-y-8 relative z-10">
              {successMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" /> {successMsg}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input type="email" value={user?.email || ''} disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input type="date" value={profileData.dateOfBirth} onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="col-span-full space-y-4">
                      <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Profile Visuals</label>
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl bg-zinc-100 dark:bg-zinc-800">
                            {imagePreview ? (
                              <img src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview) || ''} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-300"><User className="w-10 h-10" /></div>
                            )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-500 transition-colors">
                            <Camera className="w-5 h-5" />
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        </div>
                        <div className="flex-1">
                          <p className="text-zinc-500 font-medium text-sm leading-relaxed">Personalize your account with a clear photo. This helps leaders recognize you in group activities.</p>
                          <p className="text-[10px] text-zinc-400 font-black uppercase mt-2">JPG, PNG or WebP • Max 5MB</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-full pt-4">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
                        className="px-10 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black shadow-xl transition-all hover:bg-black dark:hover:bg-white flex items-center gap-3 disabled:opacity-50"
                      >
                        {saving && <Loader2 className="w-5 h-5 animate-spin" />} Save Profile
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="glass-card p-10 border border-white/40 dark:border-zinc-800/50">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-2 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-primary-500" /> Digital Security
            </h3>
            <p className="text-zinc-500 font-medium mb-8">Maintain a strong shield for your data and activities.</p>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 gap-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center mr-4 shadow-sm">
                  <Lock className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <p className="font-black text-zinc-900 dark:text-zinc-50">Account Password</p>
                  <p className="text-xs text-zinc-400 font-bold mt-1 uppercase tracking-wider">Regular updates recommended</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full md:w-auto px-6 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-black hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
              >
                Modify Password
              </button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div variants={item} className="glass-card p-8 border border-white/40 dark:border-zinc-800/50">
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-3 text-zinc-400" /> System Rank
            </h3>
            <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-8 rounded-[2rem] text-center shadow-lg shadow-primary-500/20">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Current Title</p>
              <p className="text-white text-3xl font-black tracking-tighter mb-4 uppercase">
                {user?.role || 'MEMBER'}
              </p>
              <div className="h-1 w-12 bg-white/20 mx-auto rounded-full mb-4" />
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                {user?.role === 'ADMIN'
                  ? 'Elevated access for system administration and church oversight.'
                  : 'Standard access for viewing events and tracking individual giving.'}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
