import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, getImageUrl } from '../../services/api';
import { User, Lock, Shield, Mail, Loader2, X, Eye, EyeOff } from 'lucide-react';

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
      setSuccess('Password updated successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => onClose(), 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password. Check your current password.');
    } finally {
      setSaving(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const inputClass =
    'w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-300';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Change Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
              ✓ {success}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                required
                placeholder="Enter your current password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`${inputClass} ${
                    passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                      ? 'border-red-400 dark:border-red-600 focus:ring-red-400'
                      : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                      ? 'border-green-400 dark:border-green-600 focus:ring-green-400'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Settings Page ──────────────────────────────────────────────────────────────
export default function Settings() {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [profileData, setProfileData] = useState({
    dateOfBirth: '',
    profileImageUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.memberId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/members/${user.memberId}`);
        setProfileData({
          dateOfBirth: res.data.dateOfBirth || '',
          profileImageUrl: res.data.profileImageUrl || '',
        });
        if (res.data.profileImageUrl) {
          setImagePreview(res.data.profileImageUrl);
        }
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
    if (!file.type.startsWith('image/')) { alert('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      console.log('Local image preview generated:', result.substring(0, 50) + '...');
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId) return;
    try {
      setSaving(true);
      setSuccessMsg('');

      if (selectedFile) {
        // Build FormData and explicitly clear the Content-Type so axios sets
        // the correct multipart/form-data boundary automatically.
        const formData = new FormData();
        formData.append('profileImage', selectedFile);
        if (profileData.dateOfBirth) {
          formData.append('dateOfBirth', profileData.dateOfBirth);
        }

        const response = await api.post(
          `/members/${user.memberId}/profile-image`,
          formData,
          {
            headers: {
              // Delete the global application/json default so axios can set
              // multipart/form-data with the correct boundary itself.
              'Content-Type': undefined,
            },
          }
        );

        const imageUrl =
          response.data.profileImageUrl ||
          response.data.imageUrl ||
          response.data.url;
          
        if (!imageUrl) throw new Error('Server did not return an image URL');

        setProfileData((prev) => ({ ...prev, profileImageUrl: imageUrl }));
        setImagePreview(imageUrl);
        setSelectedFile(null);

        // Update the user object in AuthContext to persist the new profile image URL
        updateUser({ profileImageUrl: imageUrl });

        window.dispatchEvent(
          new CustomEvent('profileUpdated', { detail: { profileImageUrl: imageUrl } })
        );
      } else {
        await api.put(`/members/${user.memberId}/profile`, {
          dateOfBirth: profileData.dateOfBirth,
        });
      }

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update profile';
      alert(`Failed to update profile: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      {showPasswordModal && (
        <ChangePasswordModal userId={user?.id ?? 0} onClose={() => setShowPasswordModal(false)} />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
          Account Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
          Manage your profile, security, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-8 rounded-2xl relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-900/20 rounded-bl-full z-0 opacity-50 transition-colors duration-300" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 relative z-10 flex items-center transition-colors duration-300">
              <User className="w-5 h-5 mr-2 text-primary-500" />
              Profile Information
            </h3>

            <div className="space-y-4 relative z-10">
              {successMsg && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium mb-4">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors duration-300" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 cursor-not-allowed transition-colors duration-300"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">
                  To change your email address, please contact an administrator.
                </p>
              </div>

              {loading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : (
                <form
                  onSubmit={handleUpdateProfile}
                  className="space-y-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) =>
                        setProfileData({ ...profileData, dateOfBirth: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-300 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Profile Image
                    </label>
                    <div className="space-y-3">
                      {imagePreview && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary-100 dark:border-primary-900/30 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                          <img
                            src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview) || ''}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Preview image failed to load. URL:", imagePreview);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30 cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Accepted formats: JPG, PNG, GIF, WebP. Max size: 5MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-6 px-5 py-2.5 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 transition font-medium flex items-center"
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Profile
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="glass p-8 rounded-2xl transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center transition-colors duration-300">
              <Lock className="w-5 h-5 mr-2 text-primary-500" />
              Security
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
              Keep your account secure by using a strong, unique password.
            </p>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                  Password
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 transition-colors duration-300">
                  Last changed: unknown
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center transition-colors duration-300">
              <Shield className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              Account Role
            </h3>
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 p-4 rounded-xl text-center transition-colors duration-300">
              <p className="text-primary-800 dark:text-primary-400 font-bold uppercase tracking-widest">
                {user?.role || 'USER'}
              </p>
              <p className="text-primary-600 dark:text-primary-500 text-sm mt-1">
                {user?.role === 'ADMIN'
                  ? 'Full access to all system features.'
                  : 'Standard user access.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
