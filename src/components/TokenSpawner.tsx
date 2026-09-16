import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { getSocket } from '../services/socket';
import { generateOfflineCardArt } from '../services/cardCache';

const TOKENS = [
  { id: 'treasure', name: 'Treasure Token', desc: 'Artifact - Tap, Sac: Add 1 mana', color: 'bg-amber-700 text-amber-100 border-amber-500' },
  { id: 'clue', name: 'Clue Token', desc: 'Artifact - 2, Sac: Draw a card', color: 'bg-blue-800 text-blue-100 border-blue-400' },
  { id: 'food', name: 'Food Token', desc: 'Artifact - 2, Tap, Sac: Gain 3 life', color: 'bg-emerald-800 text-emerald-100 border-emerald-400' },
  { id: 'blood', name: 'Blood Token', desc: 'Artifact - 1, Discard, Sac: Draw', color: 'bg-rose-900 text-rose-100 border-rose-500' },
  { id: 'zombie', name: '2/2 Zombie', desc: 'Creature — Zombie', color: 'bg-neutral-800 text-neutral-200 border-neutral-600' },
  { id: 'goblin', name: '1/1 Goblin', desc: 'Creature — Goblin', color: 'bg-red-800 text-red-100 border-red-500' },
  { id: 'counter-plus', name: '+1/+1 Counter', desc: 'Counter token', color: 'bg-amber-600 text-black border-yellow-300' },
];

export const TokenSpawner: React.FC = () => {
  const roomId = useGameStore(state => state.roomId);
  const myPlayerId = useGameStore(state => state.myPlayerId);
  const addCardLocal = useGameStore(state => state.addCardLocal);

  const handleSpawn = (token: typeof TOKENS[0]) => {
    const cardData = {
      instanceId: `token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      cardId: token.id,
      name: token.name,
      zone: 'battlefield' as const,
      x: 350 + Math.random() * 150, // Center of battlefield
      y: 800 + Math.random() * 100,
      tapped: false,
      faceDown: false,
      counters: 0,
      ownerId: myPlayerId || 'local-user',
      controllerId: myPlayerId || 'local-user',
      imageUrl: generateOfflineCardArt(token.name, token.desc),
      isToken: true
    };
    
    // Add locally immediately!
    addCardLocal(cardData);

    // Broadcast to others
    const socket = getSocket();
    if (socket && roomId) {
      socket.emit('addCard', cardData);
    }
  };

  return (
    <div className="absolute top-1/2 right-3 -translate-y-1/2 flex flex-col gap-1.5 z-30 pointer-events-auto" onPointerDown={e => e.stopPropagation()}>
      <div className="bg-[#14100b]/90 backdrop-blur-md p-2 rounded-2xl border border-[#c5a059]/40 shadow-2xl flex flex-col gap-1.5">
        <span className="text-[9px] text-[#c5a059] font-black uppercase tracking-widest text-center mb-0.5">
          Tokens
        </span>
        {TOKENS.map(t => (
          <button
            key={t.id}
            onClick={() => handleSpawn(t)}
            title={t.desc}
            className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center text-[9px] font-black text-center border hover:scale-110 active:scale-95 transition-all shadow-md`}
          >
            {t.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};
