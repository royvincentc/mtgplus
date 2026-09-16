import React from 'react';

interface PlaymatProps {
  color: 'red' | 'yellow' | 'blue' | 'white';
  position: 'bottom-left' | 'top-left' | 'top-right' | 'bottom-right';
}

export const Playmat: React.FC<PlaymatProps> = ({ color, position }) => {
  const colorMap = {
    red: { border: 'border-red-600', glow: 'shadow-[0_0_20px_rgba(220,38,38,0.5)]', text: 'text-red-600/50', bg: 'bg-red-900/10' },
    yellow: { border: 'border-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.5)]', text: 'text-yellow-400/50', bg: 'bg-yellow-900/10' },
    blue: { border: 'border-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]', text: 'text-blue-500/50', bg: 'bg-blue-900/10' },
    white: { border: 'border-gray-300', glow: 'shadow-[0_0_20px_rgba(209,213,219,0.5)]', text: 'text-gray-300/50', bg: 'bg-gray-800/10' },
  };

  const c = colorMap[color];

  // Rotation: top mats are rotated 180 to face the center
  const rotationClass = (position === 'top-left' || position === 'top-right') ? 'rotate-180' : '';
  
  // Placement positioning
  const posClass = 
    position === 'bottom-left' ? 'bottom-[2%] left-[2%]' :
    position === 'bottom-right' ? 'bottom-[2%] right-[2%]' :
    position === 'top-left' ? 'top-[2%] left-[2%]' :
    'top-[2%] right-[2%]';

  return (
    <div className={`absolute w-[47%] h-[46%] border-[3px] ${c.border} rounded-2xl ${posClass} ${rotationClass} ${c.glow} ${c.bg} pointer-events-none flex flex-col p-3 overflow-hidden backdrop-blur-sm`}>
      
      {/* Top half: Battlefield */}
      <div className={`flex-1 border-b-2 border-dashed ${c.border} opacity-40 mb-3 relative flex items-center justify-center`}>
         <span className={`text-4xl font-black uppercase tracking-widest ${c.text} select-none`}>Battlefield</span>
      </div>
      
      {/* Bottom half: Lands & Zones */}
      <div className="flex-1 flex gap-3 h-full">
        {/* Left zones: Library, Graveyard, Exile */}
        <div className={`w-32 h-full border-r-2 border-dashed ${c.border} opacity-60 flex flex-col gap-3 pr-3`}>
           <div className={`flex-1 border-[3px] ${c.border} rounded-lg flex items-center justify-center ${c.text} text-sm font-bold tracking-wider uppercase`}>Library</div>
           <div className={`flex-1 border-[3px] ${c.border} rounded-lg flex items-center justify-center ${c.text} text-sm font-bold tracking-wider uppercase`}>Grave</div>
           <div className={`flex-1 border-[3px] ${c.border} rounded-lg flex items-center justify-center ${c.text} text-sm font-bold tracking-wider uppercase`}>Exile</div>
        </div>
        
        {/* Land / Command Zone */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 relative flex items-center justify-center">
             <span className={`text-3xl font-black uppercase tracking-widest ${c.text} select-none opacity-50`}>Lands</span>
          </div>
          {/* Command Zone slot */}
          <div className="h-32 w-full flex gap-3 justify-end items-end">
            <div className={`w-24 h-full border-[3px] ${c.border} opacity-60 rounded-lg flex items-center justify-center ${c.text} text-xs font-bold text-center p-1`}>
              Command<br/>Zone
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
