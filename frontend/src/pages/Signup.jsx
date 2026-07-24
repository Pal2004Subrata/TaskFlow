import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import OtpInput from '../components/OtpInput';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Signup = () => {
  const { isDarkMode } = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1: Send OTP for Signup
  const onSubmitForm = async (data) => {
    try {
      setLoading(true);
      setError('');
      setFormData(data);
      await api.post('/auth/send-signup-otp', data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Signup OTP
  const handleVerifyOtp = async (otpCode) => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otpCode,
      };
      const res = await api.post('/auth/verify-signup-otp', payload);
      login(res.data.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    await api.post('/auth/send-signup-otp', formData);
  };

  return (
    <div className="relative min-h-screen flex bg-[#F8FAFC] dark:bg-[#020617] font-sans transition-colors overflow-hidden">
      {/* Soft Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vh] bg-sky-400/20 dark:bg-sky-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vh] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      {/* Left Panel - Branding & Content */}
      <div className="hidden lg:flex lg:w-1/2 text-slate-900 dark:text-white p-12 flex-col justify-between relative overflow-hidden border-r border-slate-200/50 dark:border-slate-800/50 transition-colors">
        
        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 hover:opacity-90 transition-opacity">
           <Logo className="h-20 w-auto text-slate-900 dark:text-white" />
        </Link>

        {/* Center Content */}
        <div className="relative z-10 max-w-md mx-auto mt-16 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight text-slate-900 dark:text-white">Your team's work, beautifully organized.</h2>
             <p className="text-slate-600 dark:text-slate-300 text-lg mb-12 leading-relaxed">Join thousands of modern teams who have already leveled up their productivity with TaskFlow.</p>
             
             {/* Testimonial */}
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex gap-1 mb-4 justify-center">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium leading-relaxed">"Setting up TaskFlow took minutes. By the end of the week, our entire company was using it to track every major initiative."</p>
                <div className="flex items-center gap-3 justify-center text-left">
                   <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-200 font-bold text-sm">MR</div>
                   <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">Marcus Rowe</div>
                      <div className="text-xs text-slate-500">Product Lead at StartupX</div>
                   </div>
                </div>
             </div>
           </motion.div>
        </div>
        
        {/* Footer */}
        <div className="relative z-10 text-slate-400 dark:text-slate-500 text-sm text-center mb-4">
           © 2024 TaskFlow Inc.
        </div>
      </div>

      {/* Right Panel - Signup Form / OTP */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl transition-colors">
         <div className="absolute top-8 left-8 right-8 lg:left-12 lg:right-12 flex justify-between items-center z-20">
            {step === 2 ? (
              <button 
                onClick={() => setStep(1)} 
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2 text-sm font-medium transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Edit Details
              </button>
            ) : (
              <Link to="/" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2 text-sm font-medium transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
              </Link>
            )}
            <ThemeToggle className="absolute top-6 left-6" />
         </div>
         
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.4 }}
           className="max-w-[440px] w-full mx-auto mt-16 lg:mt-0 bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-slate-100/60 dark:border-slate-800"
         >
            {/* Mobile Logo */}
            <Link to="/" className="lg:hidden flex items-center justify-center gap-2.5 mb-8 hover:opacity-90 transition-opacity">
               <Logo className="h-16 w-auto text-slate-900 dark:text-white" />
            </Link>

            {step === 1 ? (
              <>
                <div className="text-center mb-8">
                   <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Create an account</h1>
                   <p className="text-slate-500 dark:text-slate-400">Sign up in seconds to get started</p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2"
                  >
                    <div className="mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <input 
                      type="text"
                      {...register('name')}
                      className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                    <input 
                      type="email"
                      {...register('email')}
                      className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                      placeholder="you@company.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        {...register('password')}
                        className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
                  </button>
                </form>

                <p className="mt-8 text-center lg:text-left text-sm text-slate-500 dark:text-slate-400 font-medium">
                   Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Log in</Link>
                </p>
              </>
            ) : (
              <OtpInput
                email={formData?.email}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                loading={loading}
                error={error}
                title="Verify Your Email"
                description="We sent a 6-digit verification code to"
              />
            )}
         </motion.div>
      </div>
    </div>
  );
};

export default Signup;
