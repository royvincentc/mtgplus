import React, { useState, useEffect } from 'react';
import { usePinch, useDrag } from '@use-gesture/react';
import { useGameStore } from '../store/useGameStore';
import type { GameCard } from '../store/useGameStore';
import { Card } from './Card';
import { CardDetailModal } from './CardDetailModal';
import { Playmat } from './Playmat';
import { getSocket } from '../services/socket';
import { Heart } from 'lucide-react';

export const GameBoard: React.FC = () => {
  const cards = useGameStore(state => state.cards);
  const players = useGameStore(state => state.players);
  const toggleCardTapLocal = useGameStore(state => state.toggleCardTapLocal);
  const myPlayerId = useGameStore(state => state.myPlayerId);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  
  const [isSpaceDown, setIsSpaceDown] = useState(false);

  // Table scale/pan
  const [{ x, y, scale }, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpaceDown(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpaceDown(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Set initial camera focus based on user's seat
  useEffect(() => {
    const myPlayer = players[myPlayerId];
    if (myPlayer) {
      // The board is 2400x1400. 
      // Playmats are at the corners. We want to zoom into the specific quadrant.
      let initX = 0, initY = 0;
      if (myPlayer.seatColor === 'red') { initX = 600; initY = -350; }
      else if (myPlayer.seatColor === 'white') { initX = -600; initY = -350; }
      else if (myPlayer.seatColor === 'yellow') { initX = 600; initY = 350; }
      else if (myPlayer.seatColor === 'blue') { initX = -600; initY = 350; }
      
      setTransform({ x: initX, y: initY, scale: 2.2 }); // tightly zoomed on one playmat
    }
  }, [myPlayerId, players]);

  const bindDrag = useDrag(({ movement: [dx, dy], memo = [x, y], event, tap }) => {
    if (tap) return memo;
    
    const isTouchEvent = 'touches' in event;
    const isMiddleMouse = !isTouchEvent && (event as MouseEvent).button === 1;

    // Don't drag if we clicked a button or interactive element
    if ((event.target as HTMLElement).closest('button') || (event.target as HTMLElement).closest('.interactive')) {
        return memo;
    }
    
    if (isSpaceDown || isMiddleMouse || isTouchEvent) {
      setTransform(t => ({ ...t, x: memo[0] + dx, y: memo[1] + dy }));
      return memo;
    }
    return [x, y];
  }, { filterTaps: true });

  const bindPinch = usePinch(({ offset: [s] }) => {
    setTransform(t => ({ ...t, scale: Math.max(0.3, Math.min(s, 4)) }));
  });

  const handleCardTap = (card: GameCard) => {
    toggleCardTapLocal(card.instanceId);
    const socket = getSocket();
    if (socket) socket.emit('toggleCardTap', card.instanceId);
  };

  const handleCardLongPress = (card: GameCard) => {
    setSelectedCard(card);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]); 
  };

  const handleLifeChange = (playerId: string, delta: number) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('updateLife', { playerId, delta });
    }
  };

  const seatPositions = [
    { color: 'red', pos: 'bottom-left' },
    { color: 'white', pos: 'bottom-right' },
    { color: 'yellow', pos: 'top-left' },
    { color: 'blue', pos: 'top-right' }
  ] as const;

  return (
    <div 
      className={`relative w-full h-full bg-[#121212] overflow-hidden ${isSpaceDown ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`} 
      {...bindDrag()}
      {...bindPinch()}
      style={{ touchAction: 'none' }}
    >
      <div
        className="w-[2400px] h-[1400px] origin-center absolute top-1/2 left-1/2 border-2 border-gray-800 rounded-3xl bg-[#1a1a1a]"
        style={{ transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})` }}
      >
        {/* Playmats */}
        {seatPositions.map((seat, i) => (
           <Playmat key={i} color={seat.color} position={seat.pos as any} />
        ))}

        {/* Center Life Counters Area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none flex items-center justify-center">
            {/* Center Logo/Decal */}
            <div className="absolute w-32 h-32 rounded-full border-4 border-gray-700/50 flex items-center justify-center text-gray-700/50 font-bold text-2xl tracking-widest">
              MTG+
            </div>

           {Object.values(players).map((p) => {
             let posClass = '';
             let rotate = '';
             let heartColor = '';
             let nameBg = '';
             if (p.seatColor === 'red') { posClass = 'bottom-0 left-0 -translate-x-4 translate-y-4'; rotate = ''; heartColor='text-red-600'; nameBg='bg-red-900/80'; }
             if (p.seatColor === 'white') { posClass = 'bottom-0 right-0 translate-x-4 translate-y-4'; rotate = ''; heartColor='text-gray-100'; nameBg='bg-gray-800/80'; }
             if (p.seatColor === 'yellow') { posClass = 'top-0 left-0 -translate-x-4 -translate-y-4'; rotate = 'rotate-180'; heartColor='text-yellow-500'; nameBg='bg-yellow-900/80'; }
             if (p.seatColor === 'blue') { posClass = 'top-0 right-0 translate-x-4 -translate-y-4'; rotate = 'rotate-180'; heartColor='text-blue-500'; nameBg='bg-blue-900/80'; }
             
             return (
               <div key={p.id} className={`absolute w-24 h-24 flex flex-col items-center justify-center ${posClass} ${rotate} pointer-events-auto`}>
                  <div className="relative flex items-center justify-center cursor-pointer group select-none hover:scale-110 transition-transform">
                    <Heart size={80} className={`${heartColor} fill-current drop-shadow-2xl`} />
                    <span className="absolute text-3xl font-black text-black/80">{p.life}</span>
                    
                    <div className="absolute inset-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex-1 bg-black/40 hover:bg-black/60 rounded-l flex items-center justify-center font-bold text-white text-2xl" onClick={(e) => { e.stopPropagation(); handleLifeChange(p.id, -1); }}>-</div>
                      <div className="flex-1 bg-white/40 hover:bg-white/60 rounded-r flex items-center justify-center font-bold text-black text-2xl" onClick={(e) => { e.stopPropagation(); handleLifeChange(p.id, 1); }}>+</div>
                    </div>
                  </div>
                  <div className={`mt-2 px-3 py-1 rounded text-xs text-white font-bold tracking-wider ${nameBg} shadow`}>
                    {p.name}
                  </div>
               </div>
             )
           })}
        </div>

        {/* Cards rendering */}
        {cards.map(card => (
          <Card
            key={card.instanceId}
            card={card}
            onTap={handleCardTap}
            onLongPress={handleCardLongPress}
          />
        ))}
      </div>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
      
      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-20 left-4 z-20 flex flex-col gap-2 bg-gray-900/80 p-2 rounded-lg border border-gray-700 shadow-xl" onPointerDown={e => e.stopPropagation()}>
        <button className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-700 rounded font-bold" onClick={() => setTransform(t => ({...t, scale: Math.min(t.scale + 0.2, 4)}))}>+</button>
        <button className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-700 rounded font-bold" onClick={() => setTransform(t => ({...t, scale: Math.max(t.scale - 0.2, 0.3)}))}>-</button>
      </div>
      
      {isSpaceDown && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
          PAN MODE ACTIVE
        </div>
      )}
    </div>
  );
};
