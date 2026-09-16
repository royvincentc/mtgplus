import React from 'react';
import type { PlayerState } from '../store/useGameStore';

interface PlaymatProps {
  player?: PlayerState;
}

export const Playmat: React.FC<PlaymatProps> = ({ player }) => {
  // We use player.seatColor or default to gray if no player
  const color = player?.seatColor || 'gray';
  
  const colorMap: Record<string, any> = {
    red: { border: 'border-red-600', glow: 'shadow-[0_0_20px_rgba(220,38,38,0.5)]', text: 'text-red-600/50', bg: 'bg-red-900/10' },
    yellow: { border: 'border-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.5)]', text: 'text-yellow-400/50', bg: 'bg-yellow-900/10' },
    blue: { border: 'border-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]', text: 'text-blue-500/50', bg: 'bg-blue-900/10' },
    white: { border: 'border-gray-300', glow: 'shadow-[0_0_20px_rgba(209,213,219,0.5)]', text: 'text-gray-300/50', bg: 'bg-gray-800/10' },
    green: { border: 'border-green-500', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]', text: 'text-green-500/50', bg: 'bg-green-900/10' },
    purple: { border: 'border-purple-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]', text: 'text-purple-500/50', bg: 'bg-purple-900/10' },
    gray: { border: 'border-gray-600', glow: 'shadow-[0_0_20px_rgba(75,85,99,0.5)]', text: 'text-gray-600/50', bg: 'bg-gray-900/10' },
  };

  const c = colorMap[color] || colorMap.gray;

  return (
    <div className={`w-full h-full border-[3px] ${c.border} rounded-2xl ${c.glow} ${c.bg} pointer-events-none flex flex-col p-6 overflow-hidden backdrop-blur-sm relative`}>
      
      {player && (
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg bg-black/50 border border-t-0 ${c.border} text-white font-bold text-lg tracking-widest`}>
          {player.name}
        </div>
      )}

      {/* Top half: Battlefield */}
      <div className={`flex-[1.5] border-b-2 border-dashed ${c.border} opacity-40 mb-3 relative flex items-center justify-center`}>
         <span className={`text-6xl font-black uppercase tracking-widest ${c.text} select-none`}>Battlefield</span>
      </div>
      
      {/* Bottom half: Lands & Zones */}
      <div className="flex-1 flex gap-6 h-full">
        {/* Left zones: Library, Graveyard, Exile */}
        <div className={`w-40 h-full border-r-2 border-dashed ${c.border} opacity-60 flex flex-col gap-3 pr-4`}>
           <div className={`flex-1 border-[3px] ${c.border} rounded-lg flex items-center justify-center ${c.text} text-sm font-bold tracking-wider uppercase`}>Library</div>
           <div className={`flex-1 border-[3px] ${c.border} rounded-lg flex items-center justify-center ${c.text} text-sm font-bold tracking-wider uppercase`}>Grave</div>
           <div className={`flex-1 border-[3px] ${c.border} rounded-lg flex items-center justify-center ${c.text} text-sm font-bold tracking-wider uppercase`}>Exile</div>
        </div>
        
        {/* Land / Command Zone */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 relative flex items-center justify-center">
             <span className={`text-5xl font-black uppercase tracking-widest ${c.text} select-none opacity-50`}>Lands</span>
          </div>
          {/* Command Zone slot */}
          <div className="h-40 w-full flex gap-3 justify-end items-end">
            <div className={`w-32 h-full border-[3px] ${c.border} opacity-60 rounded-lg flex items-center justify-center ${c.text} text-sm font-bold text-center p-1`}>
              Command<br/>Zone
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
