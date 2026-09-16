import React, { useState } from 'react';
import { 
  RotateCcw, 
  Layers, 
  Dices, 
  Import, 
  Heart
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getSocket } from '../services/socket';

interface BottomBarProps {
  onImportClick: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onImportClick }) => {
  const myPlayerId = useGameStore(state => state.myPlayerId);
  const players = useGameStore(state => state.players);
  const updatePlayerLifeLocal = useGameStore(state => state.updatePlayerLifeLocal);
  const drawCardLocal = useGameStore(state => state.drawCardLocal);
  const untapAllLocal = useGameStore(state => state.untapAllLocal);
  const addChatMessageLocal = useGameStore(state => state.addChatMessageLocal);

  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);

  const myPlayer = players[myPlayerId] || { life: 40, name: 'You' };

  const handleLifeChange = (delta: number) => {
    updatePlayerLifeLocal(myPlayerId, delta);
    const socket = getSocket();
    if (socket) {
      socket.emit('updateLife', { playerId: myPlayerId, delta });
    }
  };

  const handleDraw = () => {
    drawCardLocal(myPlayerId);
    const socket = getSocket();
    if (socket) {
      socket.emit('drawCard', { playerId: myPlayerId });
    }
    addChatMessageLocal({
      id: Date.now().toString(),
      sender: 'System',
      text: `${myPlayer.name} drew a card.`,
      isSystem: true
    });
  };

  const handleUntapAll = () => {
    untapAllLocal(myPlayerId);
    const socket = getSocket();
    if (socket) {
      socket.emit('untapAll', { playerId: myPlayerId });
    }
    addChatMessageLocal({
      id: Date.now().toString(),
      sender: 'System',
      text: `${myPlayer.name} untapped all permanents.`,
      isSystem: true
    });
  };

  const handleRollDice = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setLastDiceRoll(roll);
    addChatMessageLocal({
      id: Date.now().toString(),
      sender: 'System',
      text: `🎲 ${myPlayer.name} rolled a ${roll} (D20)`,
      isSystem: true
    });
    setTimeout(() => setLastDiceRoll(null), 3000);
  };

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 h-16 bg-[#120f0a]/95 border-t border-[#2d2417] flex items-center justify-between px-3 sm:px-6 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.7)] backdrop-blur-md safe-area-bottom"
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Left: Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Draw Card */}
        <button 
          onClick={handleDraw}
          className="flex flex-col items-center justify-center text-[#c5a059] hover:text-[#f3d37a] active:scale-95 transition-all p-1.5 rounded-xl hover:bg-[#1b150e]"
          title="Draw Card from Library"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold uppercase tracking-wider">Draw</span>
        </button>

        {/* Untap All */}
        <button 
          onClick={handleUntapAll}
          className="flex flex-col items-center justify-center text-[#c5a059] hover:text-[#f3d37a] active:scale-95 transition-all p-1.5 rounded-xl hover:bg-[#1b150e]"
          title="Untap All Permanents"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold uppercase tracking-wider">Untap</span>
        </button>

        {/* Roll D20 */}
        <button 
          onClick={handleRollDice}
          className="flex flex-col items-center justify-center text-[#c5a059] hover:text-[#f3d37a] active:scale-95 transition-all p-1.5 rounded-xl hover:bg-[#1b150e] relative"
          title="Roll 20-Sided Die"
        >
          <Dices className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold uppercase tracking-wider">
            {lastDiceRoll !== null ? `D20: ${lastDiceRoll}` : 'Roll D20'}
          </span>
          {lastDiceRoll !== null && (
            <span className="absolute -top-7 px-2 py-0.5 bg-[#d4af37] text-black font-black text-xs rounded-full shadow-lg animate-bounce">
              {lastDiceRoll}
            </span>
          )}
        </button>

        {/* Import Deck */}
        <button 
          onClick={onImportClick}
          className="flex flex-col items-center justify-center text-[#a09380] hover:text-[#f5f0e6] active:scale-95 transition-all p-1.5 rounded-xl hover:bg-[#1b150e]"
          title="Import Deck via Text Paste"
        >
          <Import className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold uppercase tracking-wider">Import</span>
        </button>

      </div>

      {/* Right: Quick Life Counter HUD */}
      <div className="flex items-center gap-2 bg-[#1b150e] border border-[#3e3221] px-3 py-1 rounded-2xl shadow-inner">
        <Heart className="w-4 h-4 text-red-500 fill-red-500/30" />
        <span className="text-[10px] text-[#8c806f] font-black uppercase tracking-wider hidden sm:inline">My Life:</span>
        
        <button 
          onClick={() => handleLifeChange(-1)}
          className="w-7 h-7 rounded-lg bg-[#282015] hover:bg-[#342a1b] text-white font-black text-sm flex items-center justify-center active:scale-95 transition-all"
        >
          −
        </button>
        
        <span className="text-xl font-black text-[#e5c158] px-1 min-w-[32px] text-center">
          {myPlayer.life}
        </span>
        
        <button 
          onClick={() => handleLifeChange(1)}
          className="w-7 h-7 rounded-lg bg-[#282015] hover:bg-[#342a1b] text-white font-black text-sm flex items-center justify-center active:scale-95 transition-all"
        >
          +
        </button>

        <div className="hidden sm:flex items-center gap-1 border-l border-[#3e3221] pl-2 ml-1">
          <button 
            onClick={() => handleLifeChange(-5)} 
            className="text-[10px] font-bold text-[#8c806f] hover:text-red-400 px-1 py-0.5 rounded bg-[#120f0a]"
          >
            -5
          </button>
          <button 
            onClick={() => handleLifeChange(5)} 
            className="text-[10px] font-bold text-[#8c806f] hover:text-emerald-400 px-1 py-0.5 rounded bg-[#120f0a]"
          >
            +5
          </button>
        </div>
      </div>

    </div>
  );
};
