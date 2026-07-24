import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const OtpInput = ({ 
  email, 
  onVerify, 
  onResend, 
  loading = false, 
  error = '', 
  title = 'Verify Your Email',
  description = 'We sent a 6-digit code to'
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    // Only numeric input
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Handle single character
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto submit if complete
    const completeCode = newOtp.join('');
    if (completeCode.length === 6 && !newOtp.includes('')) {
      onVerify(completeCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      onVerify(pastedData);
    }
  };

  const handleResendClick = async () => {
    if (!canResend || resendLoading) return;
    try {
      setResendLoading(true);
      setResendMessage('');
      await onResend();
      setTimer(60);
      setCanResend(false);
      setResendMessage('Verification code resent!');
      setTimeout(() => setResendMessage(''), 4000);
    } catch (err) {
      // Error handled by parent or displayed via error prop
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.join('').length === 6 && !otp.includes('');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {description} <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      {resendMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{resendMessage}</span>
        </motion.div>
      )}

      {/* 6 Digit Inputs */}
      <div className="flex justify-between items-center gap-2 sm:gap-3 mb-8" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className={`w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all duration-200 outline-none ${
              digit
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
            } focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20`}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={() => onVerify(otp.join(''))}
        disabled={!isOtpComplete || loading}
        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2 mb-6"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Verifying Code...
          </>
        ) : (
          'Verify & Proceed'
        )}
      </button>

      {/* Resend Timer */}
      <div className="text-center">
        {canResend ? (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={resendLoading}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
            Resend Verification Code
          </button>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Resend code in <span className="font-semibold text-slate-600 dark:text-slate-300">{timer}s</span>
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default OtpInput;
