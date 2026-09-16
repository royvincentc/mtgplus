import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Planeswalker';

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 relative">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        
        {/* Welcome Section */}
        <div className="text-center mb-20 mt-8">
          <p className="text-orange-400 uppercase tracking-[0.3em] text-sm mb-4 font-bold shadow-orange-500 text-shadow-glow">Your Commanders Await Battle</p>
          <h1 className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
            Welcome<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">{displayName}</span>
          </h1>
        </div>

        {/* Top Commanders Box */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-10 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Trophy className="text-orange-400 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-white font-black text-xl uppercase tracking-widest drop-shadow-md">Top Commanders</h2>
                <p className="text-xs text-slate-400 font-medium">Most played commanders in the format</p>
              </div>
            </div>
            <button className="text-xs text-orange-400 border border-orange-500/30 px-4 py-2 rounded-lg hover:bg-orange-500/10 hover:border-orange-500 transition-all uppercase tracking-wider font-bold shadow-sm">
              View More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Mock Commanders */}
             <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden group hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all cursor-pointer relative translate-y-0 hover:-translate-y-1">
               <div className="absolute top-3 left-3 w-8 h-8 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white font-black text-sm z-10 shadow-lg">1</div>
               <div className="relative h-40 overflow-hidden">
                 <img src="https://cards.scryfall.io/art_crop/front/7/e/7e27fa5e-1a5a-44a4-a5eb-2b4639e72844.jpg" alt="Ur-Dragon" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
               </div>
               <div className="p-5 text-center relative -mt-8">
                 <h3 className="font-black text-white uppercase tracking-wider text-sm mb-1 drop-shadow-md">The Ur-Dragon</h3>
                 <p className="text-xs text-slate-400 mb-3 font-medium">47,928 games</p>
                 <div className="flex justify-center gap-1.5">
                   <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_5px_white]" />
                   <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_5px_blue]" />
                   <div className="w-3.5 h-3.5 rounded-full bg-slate-800 shadow-[0_0_5px_black] border border-white/20" />
                   <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_5px_red]" />
                   <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
                 </div>
               </div>
             </div>

             <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden group hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all cursor-pointer relative translate-y-0 hover:-translate-y-1">
               <div className="absolute top-3 left-3 w-8 h-8 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white font-black text-sm z-10 shadow-lg">2</div>
               <div className="relative h-40 overflow-hidden">
                 <img src="https://cards.scryfall.io/art_crop/front/8/d/8d94b8ec-ecda-43c8-a60e-1ba33e6a54a4.jpg" alt="Edgar Markov" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
               </div>
               <div className="p-5 text-center relative -mt-8">
                 <h3 className="font-black text-white uppercase tracking-wider text-sm mb-1 drop-shadow-md">Edgar Markov</h3>
                 <p className="text-xs text-slate-400 mb-3 font-medium">47,211 games</p>
                 <div className="flex justify-center gap-1.5">
                   <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_5px_red]" />
                   <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_5px_white]" />
                   <div className="w-3.5 h-3.5 rounded-full bg-slate-800 shadow-[0_0_5px_black] border border-white/20" />
                 </div>
               </div>
             </div>

             <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden group hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all cursor-pointer relative translate-y-0 hover:-translate-y-1">
               <div className="absolute top-3 left-3 w-8 h-8 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white font-black text-sm z-10 shadow-lg">3</div>
               <div className="relative h-40 overflow-hidden">
                 <img src="https://cards.scryfall.io/art_crop/front/8/f/8f6e4318-7964-44ed-a6b1-a6750033c4eb.jpg" alt="Atraxa" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
               </div>
               <div className="p-5 text-center relative -mt-8">
                 <h3 className="font-black text-white uppercase tracking-wider text-sm mb-1 drop-shadow-md">Atraxa, Grand Unifier</h3>
                 <p className="text-xs text-slate-400 mb-3 font-medium">43,917 games</p>
                 <div className="flex justify-center gap-1.5">
                   <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
                   <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_5px_white]" />
                   <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_5px_blue]" />
                   <div className="w-3.5 h-3.5 rounded-full bg-slate-800 shadow-[0_0_5px_black] border border-white/20" />
                 </div>
               </div>
             </div>
          </div>
          
          <p className="text-center text-[10px] text-slate-500 mt-6 uppercase tracking-widest font-bold">Based on games played by the community</p>
        </div>

      </div>
    </div>
  );
};
