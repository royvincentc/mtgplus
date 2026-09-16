import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Planeswalker';

  return (
    <div className="w-full h-full overflow-y-auto bg-[#121212] relative">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a130c] via-[#121212] to-black pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] opacity-20 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#b8860b]/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        
        {/* Welcome Section */}
        <div className="text-center mb-16 mt-8">
          <p className="text-gray-400 uppercase tracking-[0.3em] text-sm mb-2 font-bold">Your Commanders Await Battle</p>
          <h1 className="text-7xl font-black text-white tracking-tighter shadow-black drop-shadow-xl">
            Welcome<br/>
            <span className="text-[#b8860b]">{displayName}</span>
          </h1>
        </div>

        {/* Top Commanders Box */}
        <div className="bg-[#1a130c]/90 border border-[#b8860b]/40 rounded-2xl p-8 shadow-2xl backdrop-blur-sm max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-[#b8860b] w-6 h-6" />
              <div>
                <h2 className="text-[#b8860b] font-bold text-xl uppercase tracking-wider">Top Commanders</h2>
                <p className="text-xs text-gray-400">Most played commanders in the format</p>
              </div>
            </div>
            <button className="text-xs text-[#b8860b] border border-[#b8860b] px-3 py-1 rounded hover:bg-[#b8860b]/10 transition-colors uppercase tracking-wider font-bold">
              View More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Mock Commanders */}
             <div className="bg-black rounded-xl border border-gray-800 overflow-hidden group hover:border-[#b8860b]/50 transition-colors cursor-pointer relative">
               <div className="absolute top-2 left-2 w-6 h-6 bg-[#b8860b] rounded-full flex items-center justify-center text-black font-black text-xs z-10">1</div>
               <img src="https://cards.scryfall.io/art_crop/front/7/e/7e27fa5e-1a5a-44a4-a5eb-2b4639e72844.jpg" alt="Ur-Dragon" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               <div className="p-4 text-center">
                 <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-2">The Ur-Dragon</h3>
                 <p className="text-xs text-gray-400 mb-1">47,928 games</p>
                 <div className="flex justify-center gap-1">
                   <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_5px_white]" />
                   <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_5px_blue]" />
                   <div className="w-3 h-3 rounded-full bg-gray-800 shadow-[0_0_5px_gray]" />
                   <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_5px_red]" />
                   <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
                 </div>
               </div>
             </div>

             <div className="bg-black rounded-xl border border-gray-800 overflow-hidden group hover:border-[#b8860b]/50 transition-colors cursor-pointer relative">
               <div className="absolute top-2 left-2 w-6 h-6 bg-[#b8860b] rounded-full flex items-center justify-center text-black font-black text-xs z-10">2</div>
               <img src="https://cards.scryfall.io/art_crop/front/8/d/8d94b8ec-ecda-43c8-a60e-1ba33e6a54a4.jpg" alt="Edgar Markov" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               <div className="p-4 text-center">
                 <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-2">Edgar Markov</h3>
                 <p className="text-xs text-gray-400 mb-1">47,211 games</p>
                 <div className="flex justify-center gap-1">
                   <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_5px_red]" />
                   <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_5px_white]" />
                   <div className="w-3 h-3 rounded-full bg-gray-800 shadow-[0_0_5px_gray]" />
                 </div>
               </div>
             </div>

             <div className="bg-black rounded-xl border border-gray-800 overflow-hidden group hover:border-[#b8860b]/50 transition-colors cursor-pointer relative">
               <div className="absolute top-2 left-2 w-6 h-6 bg-[#b8860b] rounded-full flex items-center justify-center text-black font-black text-xs z-10">3</div>
               <img src="https://cards.scryfall.io/art_crop/front/8/f/8f6e4318-7964-44ed-a6b1-a6750033c4eb.jpg" alt="Atraxa" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               <div className="p-4 text-center">
                 <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-2">Atraxa, Grand Unifier</h3>
                 <p className="text-xs text-gray-400 mb-1">43,917 games</p>
                 <div className="flex justify-center gap-1">
                   <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
                   <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_5px_white]" />
                   <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_5px_blue]" />
                   <div className="w-3 h-3 rounded-full bg-gray-800 shadow-[0_0_5px_gray]" />
                 </div>
               </div>
             </div>
          </div>
          
          <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest">Based on games played by the community</p>
        </div>

      </div>
    </div>
  );
};
