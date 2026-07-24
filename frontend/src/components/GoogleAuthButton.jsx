import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const GoogleAuthButton = ({ mode = 'login', onError }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isSampleClientId = !clientId || clientId.includes('sampleclientid') || clientId.includes('your_google_client_id');

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      if (onError) onError('');

      // Fetch user profile from Google using access token
      const resProfile = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await resProfile.json();

      // Send to backend
      const res = await api.post('/auth/google', { userInfo, access_token: tokenResponse.access_token });
      
      login(res.data.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Auth Server Error:', err);
      const errMsg = err.response?.data?.message || 'Google authentication failed. Please try again.';
      if (onError) onError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (err) => {
      console.error('Google Login Popup Error:', err);
      if (onError) onError('Google login popup was closed or cancelled.');
    },
  });

  const handleClick = async () => {
    if (isSampleClientId) {
      // Demo / fallback mode for local development when real Google Client ID is not configured in .env yet
      try {
        setLoading(true);
        if (onError) onError('');

        const demoUserInfo = {
          email: 'subratapal2909@gmail.com',
          name: 'Subrata Pal',
          picture: 'https://lh3.googleusercontent.com/a/default-user',
          sub: 'google_demo_123456789'
        };

        const res = await api.post('/auth/google', { userInfo: demoUserInfo });
        login(res.data.data.user, res.data.token);
        navigate('/dashboard');
      } catch (err) {
        console.error('Demo Google Auth Error:', err);
        if (onError) onError('Google Auth demo login failed. Please configure a valid VITE_GOOGLE_CLIENT_ID in frontend/.env');
      } finally {
        setLoading(false);
      }
      return;
    }

    loginWithGoogle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold py-3 rounded-xl transition-all mb-6 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </>
      )}
    </button>
  );
};

export default GoogleAuthButton;
