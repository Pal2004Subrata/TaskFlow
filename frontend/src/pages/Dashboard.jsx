import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layout, Users, ArrowRight, Loader2, LogOut, Briefcase, Bell, Check, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-14 w-auto" />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationsDropdown />
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden md:flex items-center gap-3 mr-2 md:mr-4 border-r border-slate-200 pr-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm overflow-hidden relative">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            </button>
            <button 
              onClick={logout}
              className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Workspaces</h1>
            <p className="text-slate-500 mt-1">Manage your teams and projects across all workspaces.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Workspace
          </button>
        </header>

        {invites && invites.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Pending Invites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invites.map(invite => (
                <div key={invite._id} className="bg-white border border-indigo-100 p-4 rounded-xl shadow-sm flex flex-col gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{invite.name}</h3>
                    <p className="text-xs text-slate-500">Invited by {invite.owner.name}</p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-slate-50">
                    <button 
                      onClick={() => respondToInviteMutation.mutate({ workspaceId: invite._id, action: 'accept' })}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => respondToInviteMutation.mutate({ workspaceId: invite._id, action: 'reject' })}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-1.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-1"
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
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center max-w-2xl mx-auto mt-12">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No workspaces yet</h2>
            <p className="text-slate-500 mb-6">Create your first workspace to start collaborating with your team and managing tasks efficiently.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 mx-auto"
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
                    className="block bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50 rounded-2xl p-6 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                        <Layout className="w-6 h-6" />
                      </div>
                      <div className="bg-slate-50 p-2 rounded-full opacity-0 group-hover:opacity-100 group-hover:bg-indigo-50 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{ws.name}</h3>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                        <Users className="w-4 h-4" />
                        <span>{ws.members.length} members</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium ml-auto">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Workspace</h2>
              <p className="text-slate-500 text-sm mb-6">Give your team a dedicated space to collaborate on projects.</p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Workspace Name</label>
                  <input 
                    type="text"
                    {...register('name')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Engineering Team"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
