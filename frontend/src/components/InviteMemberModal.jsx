import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const InviteMemberModal = ({ isOpen, onClose, workspaceId }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
    }
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => api.post(`/workspaces/${workspaceId}/invite`, data),
    onSuccess: () => {
      setSuccess('User invited successfully!');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      setTimeout(() => {
        setSuccess('');
        reset();
        onClose();
      }, 2000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to invite user');
      setSuccess('');
    }
  });

  const onSubmit = (data) => {
    inviteMutation.mutate(data);
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Invite Member</h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-500 text-sm mb-6">Enter the email address of the user you want to invite to this workspace. They must already have an account.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email"
              {...register('email')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
              placeholder="e.g. colleague@company.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={inviteMutation.isPending || !!success}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center min-w-[130px]"
            >
              {inviteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Invite'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default InviteMemberModal;
