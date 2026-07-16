import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

const WorkflowBuilder = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/workspace/${id}`} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Workspace Automations</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
          <Settings className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Currently Working On It</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md text-center">
          We are building a powerful visual automation builder to streamline your tasks. It will come soon!
        </p>
      </motion.div>
    </div>
  );
};

export default WorkflowBuilder;
