import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import WorkspaceView from './pages/WorkspaceView';
import LandingPage from './pages/LandingPage';

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
    <div className="min-h-screen bg-background text-slate-900 selection:bg-primary/20 selection:text-primary">
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
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
