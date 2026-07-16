import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#020617] transition-colors">
      {/* Soft Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vh] bg-sky-400/20 dark:bg-sky-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vh] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="translate-x-8 md:translate-x-12"
        >
          <Logo className="h-20 w-auto md:h-24 text-slate-900 dark:text-white" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 font-['Forum'] tracking-wide">
            Welcome to TaskFlow
          </h1>
          <div className="flex gap-2">
            <motion.div className="w-2.5 h-2.5 rounded-full bg-indigo-500" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
            <motion.div className="w-2.5 h-2.5 rounded-full bg-indigo-500" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.div className="w-2.5 h-2.5 rounded-full bg-indigo-500" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
