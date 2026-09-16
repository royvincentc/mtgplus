import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WelcomePage: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await signInWithEmail(emailOrUsername.trim(), password);
        navigate('/dashboard');
      } else {
        await signUpWithEmail(emailOrUsername.trim(), password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full flex items-center justify-center bg-[#0a0806] relative p-4 overflow-y-auto">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#c5a059]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#9a7328]/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Main Container matching screenshot media_1789542331083.png */}
      <div className="w-full max-w-4xl bg-[#120f0b]/90 border border-[#c5a059]/30 rounded-[28px] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-md relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex flex-col items-center justify-center text-center p-4">
          <div className="relative w-40 h-44 mb-6 flex items-center justify-center">
            {/* 3 Fanned Gold Cards Icon */}
            <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-[0_0_25px_rgba(197,160,89,0.35)]" fill="none">
              {/* Left Card */}
              <rect x="12" y="32" width="46" height="66" rx="6" transform="rotate(-18 12 32)" stroke="#c5a059" strokeWidth="2.5" fill="#18130c" />
              {/* Middle Card */}
              <rect x="28" y="22" width="46" height="70" rx="6" transform="rotate(-7 28 22)" stroke="#d4af37" strokeWidth="2.5" fill="#1f1810" />
              {/* Foreground Card */}
              <rect x="36" y="16" width="48" height="74" rx="6.5" stroke="#e5c158" strokeWidth="2.8" fill="#261f14" />
              <rect x="41" y="21" width="38" height="64" rx="4" stroke="#c5a059" strokeWidth="1.5" strokeOpacity="0.5" />
              {/* Center 4-point Star */}
              <path d="M60 36 C60 47 55 51 44 53 C55 55 60 59 60 70 C60 59 65 55 76 53 C65 51 60 47 60 36 Z" fill="url(#starGold)" />
              <defs>
                <linearGradient id="starGold" x1="44" y1="36" x2="76" y2="70" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fff8db" />
                  <stop offset="0.45" stopColor="#e5c158" />
                  <stop offset="1" stopColor="#9a7328" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#c5a059] text-xs">―✦</span>
            <h1 className="text-xl md:text-2xl font-serif font-black tracking-[0.22em] text-[#e5c158] uppercase drop-shadow-md">
              COMMANDER ZONE
            </h1>
            <span className="text-[#c5a059] text-xs">✦―</span>
          </div>

          <p className="text-[#a09380] text-sm max-w-xs font-medium leading-relaxed">
            Access your decks, rooms, and manual Commander table.
          </p>
        </div>

        {/* Right Side: Auth Box */}
        <div className="flex flex-col">
          {/* Tabs: Login / Register */}
          <div className="flex border-b border-[#342b1f] pb-3 mb-6 gap-2">
            <button 
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === 'login' 
                  ? 'bg-[#261f14] border border-[#c5a059]/60 text-[#f3d37a] shadow-inner' 
                  : 'text-[#8a7d6d] hover:text-[#e5c158]'
              }`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === 'register' 
                  ? 'bg-[#261f14] border border-[#c5a059]/60 text-[#f3d37a] shadow-inner' 
                  : 'text-[#8a7d6d] hover:text-[#e5c158]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#19140e] border border-[#3e3324] hover:border-[#c5a059]/60 text-[#f5f0e6] font-bold text-sm transition-all hover:bg-[#221c13] shadow-md group"
          >
            <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google
          </button>

          {/* OR Divider */}
          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 h-[1px] bg-[#2d251a]" />
            <span className="text-[11px] font-bold tracking-widest text-[#756755] uppercase">OR</span>
            <div className="flex-1 h-[1px] bg-[#2d251a]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[#8c806f] uppercase tracking-[0.2em] mb-1.5">
                {activeTab === 'login' ? 'Email or Username' : 'Email Address'}
              </label>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder={activeTab === 'login' ? 'Enter email or username' : 'name@example.com'}
                className="w-full bg-[#0a0806] border border-[#3e3324] focus:border-[#c5a059] rounded-xl px-4 py-3 text-sm text-[#f5f0e6] placeholder-[#5a5042] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8c806f] uppercase tracking-[0.2em] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0806] border border-[#3e3324] focus:border-[#c5a059] rounded-xl px-4 py-3 pr-11 text-sm text-[#f5f0e6] placeholder-[#5a5042] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756755] hover:text-[#c5a059] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {activeTab === 'login' && (
              <div className="text-left pt-1">
                <button 
                  type="button" 
                  onClick={() => alert('Password reset link will be sent to your email.')}
                  className="text-xs text-[#a08b62] hover:text-[#e5c158] transition-colors underline font-medium"
                >
                  I forgot my password
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#8a6b32] via-[#bfa054] to-[#8a6b32] hover:from-[#9d7b3a] hover:via-[#d4af37] hover:to-[#9d7b3a] text-black font-black text-sm tracking-wider uppercase shadow-[0_4px_20px_rgba(197,160,89,0.3)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
            >
              {activeTab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Logging in...' : 'Login'}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Creating account...' : 'Register'}
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
