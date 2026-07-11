import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  Trash2,
  Settings,
  X,
  AlertTriangle,
} from 'lucide-react';

import ThemeToggle from '../components/ThemeToggle';

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProfileSettings() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
  headers: { Authorization: `Bearer ${token}` },
});
        setProfile({
          name: response.data.user.name,
          email: response.data.user.email,
        });
      } catch (err) {
        toast.error('Failed to load profile details.');
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Updating profile details...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/auth/profile`, {
        name: profile.name,
        email: profile.email,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message || 'Profile updated successfully!', { id: toastId });
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Updating security credentials...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/auth/profile`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message || 'Password updated successfully!', { id: toastId });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE in capitals to confirm.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Deleting account permanently...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Your account was successfully deleted.', { id: toastId });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err: any) {
      toast.error('Failed to delete account. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Profile & Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details, set secure passwords, choose preferences, or close your account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Details Form */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 shadow-lg shadow-indigo-100/50 dark:shadow-none space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <User className="h-5 w-5 text-indigo-600" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={profile.name}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Password Security Form */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 shadow-lg shadow-indigo-100/50 dark:shadow-none space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            <span>Change Password</span>
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="confirmNewPassword">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>

      {/* Preferences / Danger Zone */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-900">
            <div>
              <h3 className="text-base font-bold text-red-650 dark:text-red-400">Danger Zone</h3>
              <p className="text-xs text-slate-500 font-medium">Irreversible settings concerning your profile account data.</p>
            </div>
            
            <button
              id="danger-zone-btn"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-650 dark:text-red-400 font-bold text-sm rounded-xl transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 shadow-2xl space-y-6 animate-scale-up">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Delete Account Permanently</h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              This action is <span className="font-bold text-red-600">irreversible</span>. It will permanently delete your account, your uploaded resume file archives, and all AI-powered analysis reports from our systems.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Type <span className="font-bold text-slate-800 dark:text-white">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 rounded-xl border border-red-200 focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 outline-none text-sm font-semibold transition text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-semibold text-sm transition shadow-lg shadow-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
