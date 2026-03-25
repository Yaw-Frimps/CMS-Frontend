import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, getImageUrl } from '../../services/api';
import { User, Lock, Shield, Mail, Loader2, Eye, EyeOff, Camera, Calendar, CheckCircle2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Settings Page ──────────────────────────────────────────────────────────────
export default function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Profile State
  const [profileData, setProfileData] = useState({ 
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '', 
    profileImageUrl: '',
    gender: 'Other',
    membershipStatus: 'Member',
    maritalStatus: 'Single',
    emergencyContact: '',
    spouseName: '',
    profession: '',
    joinedDate: '',
    children: [] as { name: string, age: string }[]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Security State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passSaving, setPassSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.memberId) { setLoading(false); return; }
      try {
        const res = await api.get(`/members/${user.memberId}`);
        const data = res.data;
        let children = [];
        try {
          children = data.childrenData ? JSON.parse(data.childrenData) : [];
        } catch (e) {
          console.error("Failed to parse children data", e);
        }

        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          address: data.address || '',
          dateOfBirth: data.dateOfBirth || '',
          profileImageUrl: data.profileImageUrl || '',
          gender: data.gender || 'Other',
          membershipStatus: data.membershipStatus || 'Member',
          maritalStatus: data.maritalStatus || 'Single',
          emergencyContact: data.emergencyContact || '',
          spouseName: data.spouseName || '',
          profession: data.profession || '',
          joinedDate: data.joinedDate || '',
          children: children
        });
        if (data.profileImageUrl) setImagePreview(data.profileImageUrl);
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

  const addChild = () => {
    setProfileData(prev => ({
      ...prev,
      children: [...prev.children, { name: '', age: '' }]
    }));
  };

  const removeChild = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const updateChild = (index: number, field: 'name' | 'age', value: string) => {
    const newChildren = profileData.children.map((child, i) => 
      i === index ? { ...child, [field]: value } : child
    );
    setProfileData(prev => ({ ...prev, children: newChildren }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId) return;
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');
      
      const payload = {
        ...profileData,
        childrenData: JSON.stringify(profileData.children)
      };

      if (selectedFile) {
        const formData = new FormData();
        formData.append('profileImage', selectedFile);
        formData.append('dateOfBirth', payload.dateOfBirth);
        const imgRes = await api.post(`/members/${user.memberId}/profile-image`, formData, { headers: { 'Content-Type': undefined } });
        if (imgRes.data && imgRes.data.profileImageUrl) {
          payload.profileImageUrl = imgRes.data.profileImageUrl;
        }
      }

      const res = await api.put(`/members/${user.memberId}/profile`, payload);
      
      // Update local state with the returned data to ensure sync
      const data = res.data;
      let children = [];
      try {
        children = data.childrenData ? JSON.parse(data.childrenData) : [];
      } catch (e) { console.error(e); }

      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        address: data.address || '',
        dateOfBirth: data.dateOfBirth || '',
        profileImageUrl: data.profileImageUrl || '',
        gender: data.gender || 'Other',
        membershipStatus: data.membershipStatus || 'Member',
        maritalStatus: data.maritalStatus || 'Single',
        emergencyContact: data.emergencyContact || '',
        spouseName: data.spouseName || '',
        profession: data.profession || '',
        joinedDate: data.joinedDate || '',
        children: children
      });
      if (data.profileImageUrl) setImagePreview(data.profileImageUrl);

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Update global user state if needed
      if (data.profileImageUrl) {
        updateUser({ profileImageUrl: data.profileImageUrl });
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { profileImageUrl: data.profileImageUrl } }));
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'Failed to update profile.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    try {
      setPassSaving(true);
      setErrorMsg('');
      await api.put(`/users/${user?.id}/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccessMsg('Password updated successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Update failed. Check current password.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setPassSaving(false);
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Account <span className="text-gradient">Settings</span></h1>
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 outline outline-1 outline-primary-500/20 rounded text-[10px] font-black uppercase tracking-tighter">v1.1</span>
          </div>
          <p className="text-zinc-500 font-medium tracking-tight">Configure preferences, update security, and manage your church profile.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900/50 p-1.5 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'profile' 
                ? 'bg-white dark:bg-zinc-800 text-primary-600 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Personal Details
          </button>
          
          {user?.role !== 'ADMIN' && (
            <button 
              onClick={() => setActiveTab('security')}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'security' 
                  ? 'bg-white dark:bg-zinc-800 text-primary-600 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              Change Password
            </button>
          )}
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-10 border border-white/40 dark:border-zinc-800/50 relative overflow-hidden"
            >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-bl-full -mr-10 -mt-10 blur-2xl" />
            
            {activeTab === 'profile' ? (
              <>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-8 flex items-center">
                  <User className="w-6 h-6 mr-3 text-primary-500" /> Personal Identity
                </h3>

                <div className="space-y-8 relative z-10">
                  {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" /> {successMsg}
                    </motion.div>
                  )}
                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" /> {errorMsg}
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
                      <form onSubmit={handleUpdateProfile} className="col-span-full space-y-10 pt-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                            <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">First Name</label>
                            <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                              className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Last Name</label>
                            <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                              className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                            <input type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                            />
                          </div>
                          {user?.role !== 'ADMIN' && (
                            <div className="space-y-2">
                              <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Date of Birth</label>
                              <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input type="date" value={profileData.dateOfBirth} onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                  className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                />
                              </div>
                            </div>
                          )}
                          {user?.role !== 'ADMIN' && (
                            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Joined Date</label>
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                  <input type="date" value={profileData.joinedDate ? profileData.joinedDate.split('T')[0] : ''} onChange={(e) => setProfileData({ ...profileData, joinedDate: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Home Address</label>
                                <textarea rows={2} value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                  className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium resize-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {user?.role !== 'ADMIN' && (
                          <>
                            {/* Church & Demographics */}
                            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Gender</label>
                                <select value={profileData.gender} onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                  className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">System Rank (Status)</label>
                                <select value={profileData.membershipStatus} onChange={(e) => setProfileData({ ...profileData, membershipStatus: e.target.value })}
                                  className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                                >
                                  <option value="Member">Member</option>
                                  <option value="Worker">Worker</option>
                                  <option value="Leader">Leader</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Marital Status</label>
                                <select value={profileData.maritalStatus} onChange={(e) => setProfileData({ ...profileData, maritalStatus: e.target.value })}
                                  className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                                >
                                  <option value="Single">Single</option>
                                  <option value="Married">Married</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Profession</label>
                                <input type="text" value={profileData.profession} onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                                  placeholder="e.g., Software Engineer"
                                  className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                />
                              </div>
                            </div>

                            {/* Emergency & Family */}
                            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-8">
                              <div className="space-y-2">
                                <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Emergency Contact</label>
                                <input type="text" value={profileData.emergencyContact} onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                                  placeholder="Name and Phone Number"
                                  className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                />
                              </div>

                              {profileData.maritalStatus === 'Married' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Spouse's Name</label>
                                  <input type="text" value={profileData.spouseName} onChange={(e) => setProfileData({ ...profileData, spouseName: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                  />
                                </motion.div>
                              )}

                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Children</label>
                                  <button type="button" onClick={addChild} className="text-xs font-black text-primary-600 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add Child
                                  </button>
                                </div>
                                
                                <div className="space-y-3">
                                  {profileData.children.map((child, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 items-center">
                                      <input 
                                        type="text" placeholder="Child's Name" value={child.name} 
                                        onChange={(e) => updateChild(idx, 'name', e.target.value)}
                                        className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-xl border border-zinc-100 dark:border-zinc-800 font-bold text-sm"
                                      />
                                      <input 
                                        type="text" placeholder="Age" value={child.age} 
                                        onChange={(e) => updateChild(idx, 'age', e.target.value)}
                                        className="w-20 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-xl border border-zinc-100 dark:border-zinc-800 font-bold text-sm text-center"
                                      />
                                      <button type="button" onClick={() => removeChild(idx)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  ))}
                                  {profileData.children.length === 0 && (
                                    <p className="text-sm text-zinc-400 font-medium italic p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">No children listed.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="col-span-full space-y-4 pt-8 border-t border-zinc-100 dark:border-zinc-800">
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
              </>
            ) : (
              // Security Tab
              <div className="space-y-8 relative z-10 w-full max-w-lg">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-primary-500" /> Security <span className="ml-2 text-primary-600">Update</span>
                </h3>
                <p className="text-zinc-500 font-medium mb-8">Change your digital key to keep your account safe and secure.</p>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" /> {successMsg}
                    </motion.div>
                  )}
                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" /> {errorMsg}
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

                  <div className="pt-4">
                    <button type="submit" disabled={passSaving} className="px-10 py-3.5 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all flex items-center gap-3 disabled:opacity-50">
                      {passSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-8">
          <motion.div variants={item} className="glass-card p-8 border border-white/40 dark:border-zinc-800/50">
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-3 text-zinc-400" /> System Rank
            </h3>
            <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-8 rounded-[2rem] text-center shadow-lg shadow-primary-500/20">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Church Rank</p>
              <p className="text-white text-3xl font-black tracking-tighter mb-4 uppercase">
                {user?.role === 'ADMIN' ? 'ADMINISTRATOR' : (profileData.membershipStatus || 'MEMBER')}
              </p>
              <div className="h-1 w-12 bg-white/20 mx-auto rounded-full mb-6" />
              <div className="space-y-4">
                {user?.role !== 'ADMIN' && (
                  <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <span>Joined Date</span>
                    <span className="text-white/90">{profileData.joinedDate ? new Date(profileData.joinedDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <span>Account Type</span>
                  <span className="text-white/90">{user?.role || 'USER'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
