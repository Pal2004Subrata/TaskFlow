import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const dropdownRef = useRef(null);

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/auth/notifications');
      return res.data.data.notifications;
    },
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/auth/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/auth/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notificationsData ? notificationsData.filter(n => !n.read).length : 0;

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white rounded-full transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
            style={{ maxHeight: '400px' }}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
              {!notificationsData || notificationsData.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 py-8">
                  <Bell className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notificationsData.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`p-3 rounded-xl transition-all flex flex-col gap-1 ${
                      notification.read 
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800' 
                        : 'bg-indigo-50 dark:bg-indigo-500/20/50 hover:bg-indigo-50 dark:bg-indigo-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className={`text-sm font-semibold ${notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {notification.title}
                        </h4>
                        <p className={`text-xs mt-0.5 leading-relaxed ${notification.read ? 'text-slate-500 dark:text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500'}`}>
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <button 
                          onClick={() => markReadMutation.mutate(notification._id)}
                          className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 mt-1"
                        >
                          <Check className="w-3 h-3" /> Read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsDropdown;
