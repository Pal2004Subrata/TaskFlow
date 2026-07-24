import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, LayoutDashboard, Shield, Users, ArrowUpRight, BarChart3, RefreshCw, Search, Plus, Command, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const LandingPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Q3 Roadmap');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const tabList = ['Q3 Roadmap', 'Sprint 42', 'My Tasks', 'Inbox'];
    const interval = setInterval(() => {
      setActiveTab(prev => {
        const nextIndex = (tabList.indexOf(prev) + 1) % tabList.length;
        return tabList[nextIndex];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const tabs = {
    'Q3 Roadmap': {
      todo: [
        { title: "Design new landing page", tag: "Design", tagColor: "text-purple-700 bg-purple-100 ring-purple-600/20" },
        { title: "Research competitor pricing", tag: "Marketing", tagColor: "text-amber-700 bg-amber-100 ring-amber-600/20" },
        { title: "Update Terms of Service", tag: "Legal", tagColor: "text-slate-700 bg-slate-200 ring-slate-600/20" }
      ],
      inProgress: [
        { title: "Implement Stripe billing", tag: "Engineering", tagColor: "text-blue-700 bg-blue-100 ring-blue-600/20" },
        { title: "Draft Q3 announcement blog", tag: "Marketing", tagColor: "text-amber-700 bg-amber-100 ring-amber-600/20" }
      ]
    },
    'Sprint 42': {
      todo: [
        { title: "Fix horizontal scrolling bug", tag: "Bug", tagColor: "text-red-700 bg-red-100 ring-red-600/20" },
        { title: "Add animation to landing page", tag: "Feature", tagColor: "text-emerald-700 bg-emerald-100 ring-emerald-600/20" }
      ],
      inProgress: [
        { title: "Refactor task controller", tag: "Engineering", tagColor: "text-blue-700 bg-blue-100 ring-blue-600/20" },
        { title: "Database indexing", tag: "Engineering", tagColor: "text-blue-700 bg-blue-100 ring-blue-600/20" },
        { title: "Update user schema", tag: "Engineering", tagColor: "text-blue-700 bg-blue-100 ring-blue-600/20" }
      ]
    },
    'My Tasks': {
      todo: [
        { title: "Review pull requests", tag: "Code Review", tagColor: "text-indigo-700 bg-indigo-100 ring-indigo-600/20" },
        { title: "Write weekly update", tag: "Admin", tagColor: "text-slate-700 bg-slate-200 ring-slate-600/20" }
      ],
      inProgress: [
        { title: "Build notification system", tag: "Engineering", tagColor: "text-blue-700 bg-blue-100 ring-blue-600/20" }
      ]
    },
    'Inbox': {
      todo: [
        { title: "Respond to support ticket #1402", tag: "Support", tagColor: "text-amber-700 bg-amber-100 ring-amber-600/20" },
        { title: "Client onboarding call", tag: "Meeting", tagColor: "text-rose-700 bg-rose-100 ring-rose-600/20" },
        { title: "Feedback on new design", tag: "Design", tagColor: "text-purple-700 bg-purple-100 ring-purple-600/20" }
      ],
      inProgress: []
    }
  };
  const currentData = tabs[activeTab];

  return (
    <div className="relative w-full min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Soft Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vh] bg-sky-400/20 dark:bg-sky-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vh] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-[#020617] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-16 w-auto text-slate-900 dark:text-white" />
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[15px] font-semibold text-slate-700 dark:text-slate-300">
            <a href="#features" className="relative group hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 inline-block py-1">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#solutions" className="relative group hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 inline-block py-1">
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#resources" className="relative group hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 inline-block py-1">
              Resources
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle className="hidden md:flex" />
            {user ? (
              <Link 
                to="/dashboard"
                className="hidden md:flex group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 shadow-md shadow-indigo-600/20 items-center gap-2"
              >
                Dashboard <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="hidden md:block bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-base px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 shadow-xs"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup"
                  className="hidden md:flex group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 shadow-md shadow-indigo-600/25 items-center gap-2"
                >
                  Get Started <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
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
              <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</span>
                  <ThemeToggle />
                </div>
                
                <div className="flex flex-col gap-4">
                  <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700 dark:text-slate-200">Features</a>
                  <a href="#solutions" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700 dark:text-slate-200">Solutions</a>
                  <a href="#resources" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700 dark:text-slate-200">Resources</a>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-2"></div>

                {user ? (
                  <Link 
                    to="/dashboard"
                    className="w-full text-center bg-slate-900 dark:bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/login"
                      className="w-full text-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl font-medium"
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/signup"
                      className="w-full text-center bg-slate-900 dark:bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium shadow-md"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-8 pb-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            TaskFlow 2.0 is now live
            <Link to="/announcement" className="text-indigo-600 dark:text-indigo-400 flex items-center hover:underline ml-1">
              Read announcement <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6"
          >
            The new standard for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
              team productivity.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            TaskFlow brings all your teams, tasks, and tools into one unified workspace. Designed for speed, engineered for scale, and built for modern teams.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to={user ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white px-8 py-3.5 rounded-full text-base font-semibold transition-all shadow-xl shadow-slate-900/10 dark:shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              Start building for free <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-3.5 rounded-full text-base font-medium transition-all shadow-sm">
              Book a demo
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center flex flex-col sm:flex-row items-center justify-center gap-2"
          >
            <span>Or speak directly to our team:</span>
            <div className="flex items-center gap-3">
              <a href="mailto:sales@taskflow.com" className="font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">sales@taskflow.com</a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a href="tel:+18001234567" className="font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">+91 7001681546</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Graphic / Dashboard Mockup (LIGHT MODE) */}
      <section className="px-6 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative rounded-2xl bg-slate-900/5 dark:bg-white/5 p-2 md:p-4 border border-slate-900/10 dark:border-white/10 shadow-2xl dark:shadow-indigo-900/20 backdrop-blur-xl overflow-hidden">
            <div className="bg-[#F8FAFC] dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[650px] relative">
              {/* Mac Window Header */}
              <div className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 flex gap-2 items-center shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20 shadow-inner"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20 shadow-inner"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20 shadow-inner"></div>
              </div>
              
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
                {/* Sleeker Sidebar */}
                <div className="w-64 bg-slate-50/80 dark:bg-slate-900/80 border-r border-slate-200/60 dark:border-slate-800/60 p-4 hidden md:flex flex-col z-10 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-8 px-2 mt-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-50 dark:from-indigo-900/30 dark:via-purple-900/100 to-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-200">E</div>
                    <span className="font-semibold text-sm text-slate-800 dark:text-white">Engineering Team</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider px-2">Favorites</div>
                      <div className="space-y-1">
                        <div 
                          onClick={() => setActiveTab('Q3 Roadmap')}
                          className={`text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all ${activeTab === 'Q3 Roadmap' ? 'bg-white dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-indigo-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${activeTab === 'Q3 Roadmap' ? 'bg-indigo-500' : 'bg-slate-300'}`}></span> Q3 Roadmap
                        </div>
                        <div 
                          onClick={() => setActiveTab('Sprint 42')}
                          className={`text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all ${activeTab === 'Sprint 42' ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${activeTab === 'Sprint 42' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span> Sprint 42
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider px-2">Your Work</div>
                      <div className="space-y-1">
                        <div 
                          onClick={() => setActiveTab('My Tasks')}
                          className={`text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all ${activeTab === 'My Tasks' ? 'bg-white dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-blue-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${activeTab === 'My Tasks' ? 'bg-blue-500' : 'bg-slate-300'}`}></span> My Tasks
                        </div>
                        <div 
                          onClick={() => setActiveTab('Inbox')}
                          className={`text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all ${activeTab === 'Inbox' ? 'bg-white dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 shadow-sm border border-slate-200/60 dark:border-purple-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${activeTab === 'Inbox' ? 'bg-purple-500' : 'bg-slate-300'}`}></span> Inbox
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Refined Main Content Area */}
                <div className="flex-1 bg-slate-50/30 dark:bg-slate-950/30 relative flex flex-col min-w-0">
                  {/* Internal Header */}
                  <div className="h-16 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
                     <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{activeTab}</h2>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                        <div className="flex -space-x-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-200 z-10">JS</div>
                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-200 z-20">MR</div>
                          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-200 z-30">AL</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-400 dark:text-slate-500 shadow-sm w-48">
                          <Search className="w-4 h-4 text-slate-300" />
                          <span className="flex-1">Search...</span>
                          <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded px-1 text-[10px] font-medium border border-slate-200 dark:border-slate-700"><Command className="w-3 h-3"/>K</span>
                        </div>
                        <button className="bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-sm hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors flex items-center gap-1.5">
                          <Plus className="w-4 h-4" /> Task
                        </button>
                     </div>
                  </div>

                  {/* Kanban Board Area */}
                  <div className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="absolute inset-0 p-6 md:p-8 flex gap-6 overflow-hidden"
                      >
                        {/* Column 1 */}
                        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                          <div className="flex items-center justify-between px-1 shrink-0">
                            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              To Do <span className="text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{currentData.todo.length}</span>
                            </h3>
                            <button className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-0.5"><Plus className="w-4 h-4"/></button>
                          </div>
                          
                          <div className="flex flex-col gap-3 overflow-hidden pb-10">
                            {currentData.todo.map((task, i) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, ease: "easeOut" }}
                                key={i} 
                                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl shadow-sm dark:shadow-none hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shrink-0 group"
                              >
                                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex w-max mb-3 ring-1 ring-inset ${task.tagColor}`}>{task.tag}</div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 group-hover:text-slate-900 dark:hover:text-white leading-snug transition-colors">{task.title}</p>
                                <div className="flex justify-between items-center mt-auto">
                                  <div className="flex -space-x-1.5">
                                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-950"></div>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                     <CheckCircle2 className="w-4 h-4" />
                                     <span className="text-xs font-medium">0/3</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            <div className="border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 text-center text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                              + Add Task
                            </div>
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                          <div className="flex items-center justify-between px-1 shrink-0">
                            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              In Progress <span className="text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">{currentData.inProgress.length}</span>
                            </h3>
                            <button className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-0.5"><Plus className="w-4 h-4"/></button>
                          </div>
                          
                          <div className="flex flex-col gap-3 overflow-hidden pb-10">
                            {currentData.inProgress.map((task, i) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, ease: "easeOut" }}
                                key={i} 
                                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl shadow-sm dark:shadow-none hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shrink-0 group"
                              >
                                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex w-max mb-3 ring-1 ring-inset ${task.tagColor}`}>{task.tag}</div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 group-hover:text-slate-900 dark:hover:text-white leading-snug transition-colors">{task.title}</p>
                                <div className="flex justify-between items-center mt-auto">
                                  <div className="flex -space-x-1.5">
                                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-slate-900 dark:border-slate-950 flex items-center justify-center text-[8px] font-bold text-indigo-700 dark:text-indigo-300">JS</div>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-indigo-400 dark:text-indigo-500">
                                     <CheckCircle2 className="w-4 h-4" />
                                     <span className="text-xs font-medium">1/3</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            <div className="border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 text-center text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                              + Add Task
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to ship faster</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg">TaskFlow is packed with features designed to reduce friction and keep your team in the flow state.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-amber-500" />,
                title: "Lightning Fast",
                desc: "Built on a modern stack for instant load times and real-time updates without refreshing."
              },
              {
                icon: <LayoutDashboard className="w-6 h-6 text-indigo-500" />,
                title: "Flexible Workspaces",
                desc: "Create infinite workspaces for different teams, projects, or departments."
              },
              {
                icon: <Users className="w-6 h-6 text-blue-500" />,
                title: "Seamless Collaboration",
                desc: "Invite members easily and manage assignments so everyone knows what to do."
              },
              {
                icon: <Shield className="w-6 h-6 text-emerald-500" />,
                title: "Enterprise Security",
                desc: "Your data is protected with industry-standard encryption and strict access controls."
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
                title: "Advanced Analytics",
                desc: "Gain actionable insights into your team's performance with beautiful charts and data."
              },
              {
                icon: <RefreshCw className="w-6 h-6 text-rose-500" />,
                title: "Automated Workflows",
                desc: "Set up triggers and actions to put your repetitive tasks on autopilot and save time."
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 hover:shadow-sm transition-all">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="relative z-10 py-24 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Built for every team</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Whether you are pushing code, designing interfaces, or closing deals, TaskFlow adapts to your workflow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Engineering */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md dark:hover:border-slate-700 transition-all">
               <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                 <Command className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Engineering</h3>
               <p className="text-slate-600 dark:text-slate-400 mb-6">Ship faster with automated sprint planning, GitHub integrations, and issue tracking built right in.</p>
               <a href="#" className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">Explore for Engineers <ArrowRight className="w-4 h-4" /></a>
            </div>
            {/* Design */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md dark:hover:border-slate-700 transition-all">
               <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6">
                 <Users className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Design</h3>
               <p className="text-slate-600 dark:text-slate-400 mb-6">Collaborate on visual assets, gather feedback seamlessly, and hand off to developers without friction.</p>
               <a href="#" className="text-purple-600 dark:text-purple-400 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">Explore for Designers <ArrowRight className="w-4 h-4" /></a>
            </div>
            {/* Marketing */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md dark:hover:border-slate-700 transition-all">
               <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                 <BarChart3 className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Marketing</h3>
               <p className="text-slate-600 dark:text-slate-400 mb-6">Plan campaigns, track content pipelines, and hit your growth metrics with perfectly aligned teams.</p>
               <a href="#" className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">Explore for Marketers <ArrowRight className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="relative z-10 py-24 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Learn and grow</h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg">Everything you need to get the most out of TaskFlow, from beginner guides to expert strategies.</p>
            </div>
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-full font-medium transition-colors w-max">
              View all resources
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="group cursor-pointer">
               <div className="bg-slate-100 dark:bg-slate-800 aspect-video rounded-xl mb-4 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" alt="Team working" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 dark:from-indigo-900/30 dark:via-purple-900/100/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               <div className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">Blog</div>
               <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">10 ways to improve team productivity</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Discover actionable tips to reduce meetings and increase focus time.</p>
             </div>
             <div className="group cursor-pointer">
               <div className="bg-slate-100 dark:bg-slate-800 aspect-video rounded-xl mb-4 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" alt="Laptop desk" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               <div className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">Guide</div>
               <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Mastering asynchronous work</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">How fully distributed teams use TaskFlow to stay aligned across timezones.</p>
             </div>
             <div className="group cursor-pointer">
               <div className="bg-slate-100 dark:bg-slate-800 aspect-video rounded-xl mb-4 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80" alt="Business meeting" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               <div className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">Customer Story</div>
               <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">How Acme Corp scaled to 1,000 employees</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Learn how their engineering team uses our Jira import tools.</p>
             </div>
             <div className="group cursor-pointer">
               <div className="bg-slate-100 dark:bg-slate-800 aspect-video rounded-xl mb-4 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80" alt="Webinar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               <div className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wide">Webinar</div>
               <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">TaskFlow 2.0 Feature Walkthrough</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Join our product team for a deep dive into the new capabilities.</p>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 dark:bg-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to transform your workflow?</h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">Join thousands of teams already using TaskFlow to plan, execute, and deliver their best work.</p>
          <Link 
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105"
          >
            Get started for free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-slate-400 text-sm">No credit card required. Completely free forever.</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo className="h-14 w-auto text-slate-900 dark:text-white" />
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
