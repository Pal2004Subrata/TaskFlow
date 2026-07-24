import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Plus, Layout, Users, ArrowRight, Loader2, LogOut, Briefcase, Bell, Check, X, Moon, Sun, Menu } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Logo from '../components/Logo';
import ProfileModal from '../components/ProfileModal';
import NotificationsDropdown from '../components/NotificationsDropdown';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data.data.workspaces;
    }
  });

  const { data: invites } = useQuery({
    queryKey: ['invites'],
    queryFn: async () => {
      const res = await api.get('/workspaces/invites');
      return res.data.data.invites;
    }
  });

  const respondToInviteMutation = useMutation({
    mutationFn: async ({ workspaceId, action }) => {
      return api.post(`/workspaces/${workspaceId}/invites/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(workspaceSchema),
  });

  const createMutation = useMutation({
    mutationFn: (newWorkspace) => api.post('/workspaces', newWorkspace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setIsModalOpen(false);
      reset();
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-white selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors overflow-x-hidden">
      {/* Soft Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vh] bg-sky-400/20 dark:bg-sky-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vh] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>
      {/* Top Navigation */}
      <nav className="bg-[#F8FAFC] dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Logo className="h-16 w-auto text-slate-900 dark:text-white" />
            </Link>
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/" className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Go Home">
              <Home className="w-5 h-5" />
            </Link>
            <ThemeToggle className="mr-2 md:mr-3 hidden md:flex" />
            <NotificationsDropdown />
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden md:flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-5 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-sm overflow-hidden relative shadow-xs">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-base font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
            </button>
            <button 
              onClick={logout}
              className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-semibold transition-colors hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="w-4.5 h-4.5" />
              Sign out
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950"
            >
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</span>
                  <ThemeToggle />
                </div>
                <button 
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-sm overflow-hidden relative shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Profile</span>
                </button>
                <button 
                  onClick={logout}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors flex items-center gap-2 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Your Workspaces</h1>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-400 mt-1">Manage your teams and projects across all workspaces.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Workspace
          </button>
        </header>

        {invites && invites.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Pending Invites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invites.map(invite => (
                <div key={invite._id} className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-xl shadow-sm dark:shadow-none flex flex-col gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{invite.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">Invited by {invite.owner.name}</p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-slate-50 dark:border-slate-800">
                    <button 
                      onClick={() => respondToInviteMutation.mutate({ workspaceId: invite._id, action: 'accept' })}
                      className="flex-1 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 py-1.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => respondToInviteMutation.mutate({ workspaceId: invite._id, action: 'reject' })}
                      className="flex-1 bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 py-1.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : workspaces?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-12 text-center max-w-2xl mx-auto mt-12">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No workspaces yet</h2>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-400 mb-6">Create your first workspace to start collaborating with your team and managing tasks efficiently.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {workspaces?.map((ws) => (
                <motion.div
                  key={ws._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    to={`/workspace/${ws._id}`}
                    className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 rounded-2xl p-6 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-gradient-to-tr from-indigo-50 dark:from-indigo-900/30 dark:via-purple-900/100 to-blue-500 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50 group-hover:scale-110 transition-transform">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{ws.name}</h3>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        <Users className="w-4 h-4" />
                        <span>{ws.members.length} members</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium ml-auto">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Active
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Workspace</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Give your team a dedicated space to collaborate on projects.</p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Workspace Name</label>
                  <input 
                    type="text"
                    {...register('name')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Engineering Team"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
                  >
                    {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
