import React, { useState } from 'react';
import { 
  Ghost, 
  Crown, 
  Dices, 
  Sun, 
  ChevronRight, 
  RotateCcw, 
  Layers 
} from 'lucide-react';

interface BattlefieldContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onCreateToken: () => void;
  onRollDice: () => void;
  onToggleManaPool: () => void;
  onUntapAll: () => void;
  onDrawCard: () => void;
}

export const BattlefieldContextMenu: React.FC<BattlefieldContextMenuProps> = ({
  x,
  y,
  visible,
  onClose,
  onCreateToken,
  onRollDice,
  onToggleManaPool,
  onUntapAll,
  onDrawCard
}) => {
  const [submenu, setSubmenu] = useState<'none' | 'mechanics'>('none');

  if (!visible) return null;

  // Keep menu within screen boundaries
  const posX = Math.min(x, window.innerWidth - 220);
  const posY = Math.min(y, window.innerHeight - 240);

  return (
    <div
      className="fixed z-50 select-none animate-in fade-in zoom-in-95 duration-100"
      style={{ left: posX, top: posY }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Context Menu Box (Screenshot media_1789543662535.png) */}
      <div className="w-52 bg-[#120f0a] border border-[#c5a059]/50 rounded-2xl p-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] text-[#f5f0e6] backdrop-blur-md relative">
        
        {/* Create Token */}
        <button
          onClick={() => { onCreateToken(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#251e13] text-xs font-bold text-[#f5f0e6] transition-colors text-left"
        >
          <Ghost className="w-4 h-4 text-[#c5a059]" />
          Create token
        </button>

        {/* Game Mechanics > */}
        <div 
          className="relative"
          onMouseEnter={() => setSubmenu('mechanics')}
          onMouseLeave={() => setSubmenu('none')}
        >
          <button
            onClick={() => setSubmenu(submenu === 'mechanics' ? 'none' : 'mechanics')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#251e13] text-xs font-bold text-[#f5f0e6] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-4 h-4 text-[#c5a059]" />
              Game mechanics
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#8c806f]" />
          </button>

          {/* Submenu */}
          {submenu === 'mechanics' && (
            <div className="absolute left-full top-0 ml-1 w-44 bg-[#14100b] border border-[#c5a059]/40 rounded-2xl p-1.5 shadow-2xl z-50">
              <button
                onClick={() => { onUntapAll(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#251e13] text-xs font-bold text-[#f5f0e6] text-left"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#c5a059]" />
                Untap all
              </button>
              <button
                onClick={() => { onDrawCard(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#251e13] text-xs font-bold text-[#f5f0e6] text-left"
              >
                <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
                Draw card
              </button>
            </div>
          )}
        </div>

        {/* Roll Dice */}
        <button
          onClick={() => { onRollDice(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#251e13] text-xs font-bold text-[#f5f0e6] transition-colors text-left"
        >
          <Dices className="w-4 h-4 text-[#c5a059]" />
          Roll dice
        </button>

        {/* Show Mana Pool */}
        <button
          onClick={() => { onToggleManaPool(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#251e13] text-xs font-bold text-[#f5f0e6] transition-colors text-left"
        >
          <Sun className="w-4 h-4 text-[#c5a059]" />
          Show mana pool
        </button>

      </div>
    </div>
  );
};
