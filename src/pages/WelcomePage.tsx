import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const WelcomePage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#110c08] relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#b8860b]/10 to-transparent pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center max-w-2xl text-center p-8 bg-[#1a130c]/80 backdrop-blur-sm border border-[#b8860b]/30 rounded-2xl shadow-2xl">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#f8d070] to-[#b8860b] mb-4 tracking-tighter">
          MTG+ TABLETOP
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          The ultimate browser-based multiplayer Magic: The Gathering experience. Play with friends, build decks, and conquer the battlefield.
        </p>

        <button 
          onClick={signInWithGoogle}
          className="flex items-center gap-3 bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>

        <p className="text-xs text-gray-500 mt-6">
          By signing in, you agree to the mystical terms of service.
        </p>
      </div>
    </div>
  );
};
