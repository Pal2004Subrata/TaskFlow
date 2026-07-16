import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Search, Loader2, Trash2, UserPlus, Calendar, CheckSquare, Clock, Command, CheckCircle2, X, Moon, Sun, Menu } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import TaskModal from '../components/TaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import ProfileModal from '../components/ProfileModal';
import ChatInterface from '../components/ChatInterface';
import NotificationsDropdown from '../components/NotificationsDropdown';

const WorkspaceView = () => {
  const { id: workspaceId } = useParams();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: workspace, isLoading: wsLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}`);
      return res.data.data.workspace;
    }
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', workspaceId, debouncedSearch, statusFilter, priorityFilter, page],
    queryFn: async () => {
      const params = {
        workspace: workspaceId,
        page,
        limit: 50, // Increase limit for Kanban view
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      };
      const res = await api.get('/tasks', { params });
      return res.data;
    }
  });

  const { data: messagesData } = useQuery({
    queryKey: ['messages', workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/messages`);
      return res.data.data.messages;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (activeTab === 'chat') {
      localStorage.setItem(`chatView_${workspaceId}`, Date.now().toString());
    }
  }, [activeTab, messagesData, workspaceId]);

  const lastViewTime = localStorage.getItem(`chatView_${workspaceId}`) || '0';
  const hasUnreadChat = activeTab !== 'chat' && 
    messagesData && 
    messagesData.length > 0 && 
    messagesData[messagesData.length - 1].sender._id !== user?._id &&
    new Date(messagesData[messagesData.length - 1].createdAt).getTime() > parseInt(lastViewTime, 10);



  const deleteWorkspaceMutation = useMutation({
    mutationFn: () => api.delete(`/workspaces/${workspaceId}`),
    onSuccess: () => {
      navigate('/dashboard');
    }
  });



  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-700 bg-red-100 ring-red-600/20';
      case 'Medium': return 'text-amber-700 bg-amber-100 ring-amber-600/20';
      case 'Low': return 'text-blue-700 bg-blue-100 ring-blue-600/20';
      default: return 'text-slate-700 bg-slate-200 ring-slate-600/20';
    }
  };

  const tasks = tasksData?.data.tasks || [];
  const todoTasks = tasks.filter(t => t.status === 'To Do');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  const renderTaskCard = (task, i) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, ease: "easeOut" }}
      key={task._id} 
      onClick={() => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
      }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl shadow-sm dark:shadow-none hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shrink-0 group flex flex-col"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex w-max ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
          {task.priority} Priority
        </div>
        {task.dueDate && (
           <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
             <Calendar className="w-3 h-3" />
             {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
           </div>
        )}
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug transition-colors">{task.title}</p>
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      )}
      
      {task.createdBy && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 mt-auto">Created by <span className="font-medium text-slate-500 dark:text-slate-400 dark:text-slate-400">{task.createdBy.name}</span></p>
      )}
      
      <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <>
              <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[9px] font-bold text-indigo-700 shadow-sm shrink-0" title={task.assignee.name}>
                {task.assignee.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">Assigned to: <span className="font-medium text-slate-600 dark:text-slate-400">{task.assignee.name}</span></span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[9px] font-bold text-slate-400 shadow-sm shrink-0" title="Unassigned">
                ?
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Unassigned</span>
            </>
          )}
        </div>
        <div className={`flex items-center gap-1.5 shrink-0 ${task.status === 'Done' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
           <CheckCircle2 className="w-4 h-4" />
           <span className="text-xs font-medium">
             {task.status === 'Done' ? 'Done' : 'Task'}
           </span>
        </div>
      </div>
    </motion.div>
  );

  if (wsLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20 transition-colors">
      {/* Workspace Header - Top nav */}
      <div className="bg-white dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 dark:text-slate-400 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[150px] md:max-w-md">{workspace?.name}</h1>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1"><UserPlus className="w-3 h-3" /> {workspace?.members.length} Members</span>
                <span className="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span className="hidden md:block">Admin: {workspace?.owner.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            <ThemeToggle className="mr-2 md:mr-4 hidden md:flex" />
            <NotificationsDropdown />
            {workspace?.owner._id === user?._id && (
              <>
                <button 
                  onClick={() => setIsInviteOpen(true)}
                  className="hidden md:flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Invite
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm('Are you sure you want to delete this workspace and ALL its tasks?')) {
                      deleteWorkspaceMutation.mutate();
                    }
                  }}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors hidden md:flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
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
                {workspace?.owner._id === user?._id && (
                  <>
                    <button 
                      onClick={() => {
                        setIsInviteOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-slate-700 dark:text-slate-200 text-sm font-medium transition-opacity w-full text-left p-2 bg-slate-50 dark:bg-slate-900 rounded-lg"
                    >
                      <UserPlus className="w-4 h-4" /> Invite Members
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm('Are you sure you want to delete this workspace and ALL its tasks?')) {
                          deleteWorkspaceMutation.mutate();
                        }
                      }}
                      className="flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium transition-opacity w-full text-left p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Workspace
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-4">

          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Tasks Board
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`relative pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Team Chat
            {hasUnreadChat && (
              <span className="absolute top-0 -right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
          </div>
          <div className="flex items-center gap-3 pb-2">
            <Link to={`/workspace/${workspaceId}/analytics`} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
              Analytics
            </Link>
            <Link to={`/workspace/${workspaceId}/workflows`} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition">
              Automations
            </Link>
          </div>
        </div>
        
        {activeTab === 'chat' ? (
          <div className="h-[700px]">
            <ChatInterface workspaceId={workspaceId} members={workspace?.members || []} />
          </div>
        ) : (
          <div className="bg-[#F8FAFC] dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[750px] relative">
          
          {/* Internal Header */}
          <div className="h-16 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-wrap items-center justify-between px-6 shrink-0 z-10 gap-4">
             <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white hidden sm:block">Tasks</h2>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
                <div 
                  className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => setIsMembersModalOpen(true)}
                >
                   {workspace?.members.slice(0, 4).map((member, idx) => {
                      const colors = [
                        'bg-indigo-100 text-indigo-700',
                        'bg-emerald-100 text-emerald-700',
                        'bg-amber-100 text-amber-700',
                        'bg-rose-100 text-rose-700'
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div key={member._id} className={`w-7 h-7 rounded-full ${color} border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-bold shadow-sm z-${40 - idx * 10}`} title={member.name}>
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                      )
                   })}
                   {workspace?.members.length > 4 && (
                     <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-950 dark:border-slate-950 flex items-center justify-center text-[10px] font-bold z-0 shadow-sm">
                       +{workspace.members.length - 4}
                     </div>
                   )}
                </div>
             </div>
             
             <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-400 dark:text-slate-500 shadow-sm min-w-[180px] relative group">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full"
                  />
                  <span className="hidden lg:flex items-center gap-0.5 bg-slate-100 text-slate-500 dark:text-slate-400 rounded px-1 text-[10px] font-medium border border-slate-200"><Command className="w-3 h-3"/>K</span>
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-slate-600 dark:text-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                >
                  <option value="">Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                
                <select 
                  value={priorityFilter}
                  onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-slate-600 dark:text-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                >
                  <option value="">Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                
                <button 
                  onClick={() => {
                    setSelectedTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-sm hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Task
                </button>
             </div>
          </div>

          {/* Kanban Board Area */}
          <div className="flex-1 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
            {tasksLoading ? (
               <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : tasks.length === 0 && !search && !statusFilter && !priorityFilter ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                  <CheckSquare className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-900 dark:text-white font-semibold text-lg mb-1">No tasks found</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm">Your workspace is empty. Create a new task to get your team started on their goals.</p>
                <button 
                  onClick={() => {
                    setSelectedTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create First Task
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 p-6 flex gap-6 overflow-x-auto custom-scrollbar">
                
                {/* To Do Column */}
                <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1 shrink-0">
                    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      To Do <span className="text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{todoTasks.length}</span>
                    </h3>
                    <button 
                      onClick={() => {
                        setSelectedTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors bg-white hover:bg-slate-100 border border-slate-200 rounded p-0.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4"/>
                    </button>
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto pb-10 hide-scrollbar flex-1">
                    {todoTasks.map((task, i) => renderTaskCard(task, i))}
                    <div 
                      onClick={() => {
                        setSelectedTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 text-center text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      + Add Task
                    </div>
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1 shrink-0">
                    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      In Progress <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto pb-10 hide-scrollbar flex-1">
                    {inProgressTasks.map((task, i) => renderTaskCard(task, i))}
                  </div>
                </div>

                {/* Done Column */}
                <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1 shrink-0">
                    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      Done <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{doneTasks.length}</span>
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto pb-10 hide-scrollbar flex-1">
                    {doneTasks.map((task, i) => renderTaskCard(task, i))}
                  </div>
                </div>

              </div>
            )}
          </div>
          
          {/* Pagination Controls - Moved to bottom of the board for better access */}
          {tasksData?.totalPages > 1 && (
            <div className="h-14 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-center px-6 shrink-0 gap-4">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md disabled:opacity-50 text-xs font-medium transition-colors shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Page {page} of {tasksData.totalPages}
              </span>
              <button 
                disabled={page === tasksData.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md disabled:opacity-50 text-xs font-medium transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Members Modal */}
      <AnimatePresence>
        {isMembersModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Members</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{workspace?.members.length} total members</p>
                </div>
                <button 
                  onClick={() => setIsMembersModalOpen(false)} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-3">
                {workspace?.members.map(member => (
                  <div key={member._id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{member.name} {member._id === workspace?.owner._id && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full ml-2">Admin</span>}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <InviteMemberModal 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        workspaceId={workspace?._id}
      />

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      {/* Task Modal Component */}
      {isTaskModalOpen && (
        <TaskModal 
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          workspaceId={workspaceId}
          workspaceMembers={workspace?.members}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default WorkspaceView;
