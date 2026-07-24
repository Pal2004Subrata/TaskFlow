import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { ArrowLeft, Rocket, Zap, Users, Layout } from 'lucide-react';

export default function Announcement() {
  const updates = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Lightning Fast Workflows",
      desc: "We've completely rewritten our workflow engine from the ground up to be 10x faster and far more responsive."
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Enhanced Collaboration",
      desc: "Real-time sockets mean your entire team sees updates the second they happen. No refreshing required."
    },
    {
      icon: <Layout className="w-5 h-5" />,
      title: "Redesigned Interface",
      desc: "A beautiful, decluttered UI that helps you focus on what actually matters—getting your best work done."
    }
  ];

  return (
    <div className="min-h-screen lg:h-screen w-full overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-[#020617] selection:bg-indigo-500/30 font-sans relative">
      
      {/* Soft Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sky-400/20 dark:bg-sky-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <nav className="relative z-10 w-full px-6 sm:px-8 py-6 flex justify-between items-center max-w-6xl mx-auto">
        <Link to="/" className="group flex items-center gap-2 transition-transform hover:scale-105">
          <Logo className="h-16 w-auto" />
        </Link>
        <Link 
          to="/" 
          className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/70 dark:bg-slate-900/70 text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md"
        >
          <ArrowLeft className="w-4.5 h-4.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 w-full max-w-5xl mx-auto pb-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-2.5 bg-indigo-500 text-white rounded-xl mb-4 shadow-lg shadow-indigo-500/30">
            <Rocket className="w-6 h-6" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Forum', serif" }}>
            TaskFlow 2.0 is Live
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            We are thrilled to announce the biggest update in our history. Here is everything new we just shipped.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="w-full space-y-4"
        >
          {updates.map((update, idx) => (
            <motion.div 
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-full group-hover:scale-110 transition-transform duration-300">
                {update.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1" style={{ fontFamily: "'Forum', serif" }}>{update.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                  {update.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </main>
    </div>
  );
}
