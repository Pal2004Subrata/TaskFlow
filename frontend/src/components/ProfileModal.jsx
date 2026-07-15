import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Camera, Shield, User as UserIcon, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
  passwordCurrent: z.string().min(1, 'Current password is required'),
  password: z.string().min(6, 'New password must be at least 6 characters'),
});

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, login } = useAuth(); // We need login to update context user
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.patch('/auth/update-me', data),
    onSuccess: (res) => {
      setSuccessMsg('Profile updated successfully!');
      setErrorMsg('');
      // Update local storage and context
      login(res.data.data.user, localStorage.getItem('token'));
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
      setSuccessMsg('');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data) => api.patch('/auth/update-password', data),
    onSuccess: (res) => {
      setSuccessMsg('Password updated successfully!');
      setErrorMsg('');
      resetPassword();
      // Update token
      login(res.data.data.user, res.data.token);
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update password');
      setSuccessMsg('');
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = (data) => {
    const payload = { ...data };
    if (avatarPreview && avatarPreview !== user.avatar) {
      payload.avatar = avatarPreview;
    }
    updateProfileMutation.mutate(payload);
  };

  const onPasswordSubmit = (data) => {
    updatePasswordMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col shrink-0">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
            <button onClick={onClose} className="md:hidden p-1 hover:bg-slate-200 rounded-full text-slate-500 dark:text-slate-400 dark:text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex flex-row md:flex-col gap-2">
            <button 
              onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white'}`}
            >
              <UserIcon className="w-4 h-4" /> Profile
            </button>
            <button 
              onClick={() => { setActiveTab('security'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white'}`}
            >
              <Shield className="w-4 h-4" /> Security
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 relative">
          <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/50 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white">
            <X className="w-5 h-5" />
          </button>

          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          {activeTab === 'profile' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h3>
              
              <div className="mb-8 flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 dark:text-slate-500 text-3xl font-bold">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium"
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    Change
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Profile Picture</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">JPG, GIF or PNG. Max size of 5MB.</p>
                  {avatarPreview && avatarPreview !== user.avatar && (
                    <button 
                      onClick={() => setAvatarPreview(user.avatar || '')}
                      className="text-xs text-rose-600 font-medium mt-2 hover:text-rose-700"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <input 
                    type="text"
                    {...registerProfile('name')}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-slate-500 shadow-sm"
                  />
                  {profileErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{profileErrors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <input 
                    type="email"
                    {...registerProfile('email')}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-slate-500 shadow-sm"
                  />
                  {profileErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{profileErrors.email.message}</p>}
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center min-w-[140px]"
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Security & Password</h3>
              
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      {...registerPassword('passwordCurrent')}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-slate-500 shadow-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.passwordCurrent && <p className="text-red-500 text-xs mt-1.5 font-medium">{passwordErrors.passwordCurrent.message}</p>}
                </div>
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      {...registerPassword('password')}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-slate-500 shadow-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{passwordErrors.password.message}</p>}
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={updatePasswordMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center min-w-[160px]"
                  >
                    {updatePasswordMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileModal;
