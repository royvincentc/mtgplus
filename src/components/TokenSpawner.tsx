import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { getSocket } from '../services/socket';

const TOKENS = [
  { id: 'treasure', name: 'Treasure', color: 'bg-yellow-600' },
  { id: 'clue', name: 'Clue', color: 'bg-blue-600' },
  { id: 'food', name: 'Food', color: 'bg-green-600' },
  { id: 'blood', name: 'Blood', color: 'bg-red-600' },
  { id: 'zombie', name: '2/2 Zombie', color: 'bg-gray-800' },
  { id: 'goblin', name: '1/1 Goblin', color: 'bg-red-700' },
  { id: 'treasure-chest', name: '+1/+1', color: 'bg-white text-black' },
];

export const TokenSpawner: React.FC = () => {
  const roomId = useGameStore(state => state.roomId);
  const myPlayerId = useGameStore(state => state.myPlayerId);

  const handleSpawn = (token: typeof TOKENS[0]) => {
    const socket = getSocket();
    if (!socket || !roomId) return;
    
    const cardData = {
      instanceId: Math.random().toString(36).substring(7),
      cardId: token.id,
      name: token.name,
      zone: 'battlefield',
      x: window.innerWidth / 2 - 50, // rough center screen spawn
      y: window.innerHeight / 2 - 70,
      tapped: false,
      faceDown: false,
      counters: 0,
      ownerId: myPlayerId,
      controllerId: myPlayerId,
      isToken: true
    };
    
    socket.emit('addCard', cardData);
  };

  return (
    <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 z-30 pointer-events-auto" onPointerDown={e => e.stopPropagation()}>
      <div className="bg-gray-900/80 p-2 rounded-xl border border-gray-700 shadow-xl flex flex-col gap-2">
        <h3 className="text-[10px] text-gray-400 font-bold uppercase text-center mb-1">Tokens</h3>
        {TOKENS.map(t => (
          <button
            key={t.id}
            onClick={() => handleSpawn(t)}
            className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-[10px] font-bold text-center border-2 border-gray-700 hover:scale-110 active:scale-95 transition-transform shadow`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
};
