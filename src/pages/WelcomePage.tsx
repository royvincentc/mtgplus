import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const WelcomePage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[120px] pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center max-w-3xl text-center p-12 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 mb-6 tracking-tighter drop-shadow-sm">
          MTG <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600">PLUS</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-12 font-medium">
          The ultimate browser-based multiplayer Magic: The Gathering experience. Play with friends, build decks, and conquer the battlefield.
        </p>

        <button 
          onClick={signInWithGoogle}
          className="flex items-center gap-4 bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl hover:shadow-orange-500/20 group"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
          Continue with Google
        </button>

        <p className="text-xs text-slate-500 mt-8 font-medium">
          By signing in, you agree to the mystical terms of service.
        </p>
      </div>
    </div>
  );
};
