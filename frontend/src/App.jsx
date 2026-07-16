import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import WorkspaceView from './pages/WorkspaceView';
import LandingPage from './pages/LandingPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-700 dark:selection:text-indigo-300">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PublicRoute><PageTransition><Login /></PageTransition></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><PageTransition><Signup /></PageTransition></PublicRoute>} />
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/:id" 
            element={
              <ProtectedRoute>
                <PageTransition><WorkspaceView /></PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/:id/analytics" 
            element={
              <ProtectedRoute>
                <PageTransition><AnalyticsDashboard /></PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/:id/workflows" 
            element={
              <ProtectedRoute>
                <PageTransition><WorkflowBuilder /></PageTransition>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
