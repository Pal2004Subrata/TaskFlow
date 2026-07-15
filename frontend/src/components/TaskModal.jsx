import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().optional().or(z.literal('')),
  assignee: z.string().optional().or(z.literal('')),
});

const TaskModal = ({ isOpen, onClose, workspaceId, workspaceMembers, task }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const isEditing = !!task;
  // Creator can edit all fields
  const canEdit = !isEditing || task.createdBy._id === user._id;
  // Assignee or creator can edit status
  const canEditStatus = !isEditing || task.createdBy._id === user._id || task.assignee?._id === user._id;
  // Only creator can edit priority
  const canEditPriority = !isEditing || task.createdBy._id === user._id;
  const canDelete = isEditing && task.createdBy._id === user._id;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'To Do',
      priority: task?.priority || 'Medium',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignee: task?.assignee?._id || '',
    }
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignee: task.assignee?._id || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: '',
        assignee: '',
      });
    }
  }, [task, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, workspace: workspaceId };
      if (isEditing) {
        return api.patch(`/tasks/${task._id}`, payload);
      }
      return api.post('/tasks', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      onClose();
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to save task');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${task._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      onClose();
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  });

  const onSubmit = (data) => {
    const payload = { ...data };
    if (payload.dueDate) {
      payload.dueDate = new Date(payload.dueDate).toISOString();
    }
    saveMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:border-slate-800 p-8 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEditing ? (canEdit ? 'Edit Task' : 'View Task') : 'Create Task'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/50 rounded-full transition-colors text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
            <input 
              type="text"
              disabled={!canEdit}
              {...register('title')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800/50 transition-all placeholder:text-slate-400 dark:text-slate-500 placeholder:font-normal"
              placeholder="e.g. Design the new landing page"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea 
              disabled={!canEdit}
              {...register('description')}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800/50 transition-all placeholder:text-slate-400 dark:text-slate-500 resize-y"
              placeholder="Add more details about this task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select 
                disabled={!canEditStatus}
                {...register('status')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800/50 transition-all appearance-none"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select 
                disabled={!canEditPriority}
                {...register('priority')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800/50 transition-all appearance-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
              <input 
                type="date"
                disabled={!canEdit}
                {...register('dueDate')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assignee</label>
              <select 
                disabled={!canEdit}
                {...register('assignee')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800/50 transition-all appearance-none"
              >
                <option value="">Unassigned</option>
                {workspaceMembers?.map(member => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {!canEditStatus && isEditing && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>You do not have permission to edit this task. Only the creator or the assignee can modify it.</p>
            </div>
          )}
          
          {canEditStatus && !canEdit && isEditing && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm mt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>As the assignee, you can only change the status of this task. Contact the creator to edit other details.</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this task?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm border border-transparent hover:border-red-100"
                >
                  <Trash2 className="w-4 h-4" /> Delete Task
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 dark:text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 hover:text-slate-900 dark:text-white transition-colors"
              >
                {canEditStatus ? 'Cancel' : 'Close'}
              </button>
              {canEditStatus && (
                <button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center min-w-[130px]"
                >
                  {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Task')}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskModal;
