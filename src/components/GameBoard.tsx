import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const maxPlayers = parseInt(searchParams.get('max') || '4', 10);

  // Dynamic Layout Algorithm
  // We want to arrange `maxPlayers` playmats in a circle or facing rows.
  // 1 or 2 players: 1 top, 1 bottom
  // 3 or 4 players: 2 top, 2 bottom (like the old 2x2 grid)
  // 5 or 6 players: 3 top, 3 bottom
  
  const cols = Math.ceil(maxPlayers / 2);
  const playmatWidth = 1200;
  const playmatHeight = 700;
  const padding = 100;
  
  const tableWidth = cols * playmatWidth + (cols + 1) * padding;
  const tableHeight = 2 * playmatHeight + 3 * padding;

  const generateSeatPositions = () => {
    const seats: Record<string, { x: number, y: number, rotate: number }> = {};
    const colors = ['red', 'blue', 'yellow', 'white', 'green', 'purple']; // extended colors
    
    for (let i = 0; i < maxPlayers; i++) {
      const isTopRow = i >= Math.ceil(maxPlayers / 2);
      const colIndex = i % Math.ceil(maxPlayers / 2);
      
      seats[colors[i % colors.length]] = {
        x: padding + colIndex * (playmatWidth + padding),
        y: isTopRow ? padding : tableHeight - padding - playmatHeight,
        rotate: isTopRow ? 180 : 0
      };
    }
    return seats;
  };
  
  const seatPositions = generateSeatPositions();

  // Initialize the camera zoomed in on the local player's specific quadrant
  useEffect(() => {
    const myPlayer = players[myPlayerId];
    if (myPlayer && seatPositions[myPlayer.seatColor]) {
      const pos = seatPositions[myPlayer.seatColor];
      // Target coordinates: the center of their playmat
      const targetX = pos.x + playmatWidth / 2;
      const targetY = pos.y + playmatHeight / 2;
      
      const scale = 1.8;
      
      // We want targetX * scale + translateX = window.innerWidth / 2
      const initX = window.innerWidth / 2 - (targetX * scale);
      const initY = window.innerHeight / 2 - (targetY * scale);
      
      setTransform({ x: initX, y: initY, scale });
    } else {
      // Default center zoom if seat color isn't assigned yet
      setTransform({
        x: window.innerWidth / 2 - (tableWidth / 2) * 1.0,
        y: window.innerHeight / 2 - (tableHeight / 2) * 1.0,
        scale: 1.0
      });
    }
  }, [myPlayerId, players, maxPlayers]);

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

  const updatePlayerLifeLocal = useGameStore(state => state.updatePlayerLifeLocal);

  const handleLifeChange = (playerId: string, delta: number) => {
    updatePlayerLifeLocal(playerId, delta);
    const socket = getSocket();
    if (socket) {
      socket.emit('updateLife', { playerId, delta });
    }
  };


  return (
    <div 
      className={`relative w-full h-full bg-[#121212] overflow-hidden ${isSpaceDown ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`} 
      {...bindDrag()}
      {...bindPinch()}
      style={{ touchAction: 'none' }}
    >
      <div
        className="origin-center absolute top-1/2 left-1/2 border-2 border-gray-800 rounded-3xl bg-[#1a1a1a]"
        style={{ 
          width: tableWidth, 
          height: tableHeight, 
          transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})` 
        }}
      >
        {/* Dynamic Playmats */}
        {Object.entries(seatPositions).map(([color, pos]) => (
          <div 
            key={color}
            className="absolute"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`,
              width: playmatWidth,
              height: playmatHeight
            }}
          >
            {/* Find player assigned to this color, if any */}
            <Playmat player={Object.values(players).find(p => p.seatColor === color)} />
          </div>
        ))}

        {/* Center Life Counters Area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none flex items-center justify-center">
            {/* Center Logo/Decal */}
            <div className="absolute w-32 h-32 rounded-full border-4 border-gray-700/50 flex items-center justify-center text-gray-700/50 font-bold text-2xl tracking-widest">
              MTG+
            </div>

           {Object.values(players).map((p) => {
             const seatPos = seatPositions[p.seatColor];
             if (!seatPos) return null;
             
             // We want the life counter near the center edge of the player's mat
             // If rotate is 0 (bottom row), place it near the top center of their mat.
             // If rotate is 180 (top row), place it near the bottom center of their mat.
             const isTop = seatPos.rotate === 180;
             const px = seatPos.x + playmatWidth / 2;
             const py = isTop ? seatPos.y + playmatHeight + 50 : seatPos.y - 50;
             
             // Translate from table top-left (px, py) to center-relative for absolute positioning
             // Wait, the center area is absolute top-1/2 left-1/2, meaning (0,0) is center of table.
             const centerX = px - tableWidth / 2;
             const centerY = py - tableHeight / 2;

             let heartColor = 'text-gray-400';
             let nameBg = 'bg-gray-800/80';
             if (p.seatColor === 'red') { heartColor='text-red-600'; nameBg='bg-red-900/80'; }
             else if (p.seatColor === 'blue') { heartColor='text-blue-500'; nameBg='bg-blue-900/80'; }
             else if (p.seatColor === 'yellow') { heartColor='text-yellow-500'; nameBg='bg-yellow-900/80'; }
             else if (p.seatColor === 'white') { heartColor='text-gray-100'; nameBg='bg-gray-700/80'; }
             else if (p.seatColor === 'green') { heartColor='text-green-500'; nameBg='bg-green-900/80'; }
             else if (p.seatColor === 'purple') { heartColor='text-purple-500'; nameBg='bg-purple-900/80'; }
             
             return (
               <div 
                 key={p.id} 
                 className={`absolute w-24 h-24 flex flex-col items-center justify-center pointer-events-auto ${isTop ? 'rotate-180' : ''}`}
                 style={{ transform: `translate(${centerX - 48}px, ${centerY - 48}px) ${isTop ? 'rotate(180deg)' : ''}` }}
               >
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

      {/* Floating Players Life Tracker (Always accessible) */}
      <div 
        className="absolute top-4 left-4 z-30 bg-[#120f0a]/90 backdrop-blur-md border border-[#c5a059]/40 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 min-w-[200px]"
        onPointerDown={e => e.stopPropagation()}
      >
        <span className="text-[10px] text-[#c5a059] font-black uppercase tracking-widest flex items-center gap-1.5 border-b border-[#2d2417] pb-1.5">
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Life Tracker
        </span>
        <div className="space-y-2">
          {Object.values(players).map(p => {
            const isMe = p.id === myPlayerId;
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-white truncate max-w-[90px]">
                  {p.name} {isMe && <span className="text-[9px] text-[#c5a059]">(You)</span>}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleLifeChange(p.id, -1)}
                    className="w-6 h-6 rounded-md bg-[#221a10] hover:bg-[#34281a] border border-[#3e3221] text-white font-black text-xs flex items-center justify-center active:scale-95"
                  >
                    −
                  </button>
                  <span className="font-black text-sm text-[#e5c158] min-w-[24px] text-center">
                    {p.life}
                  </span>
                  <button
                    onClick={() => handleLifeChange(p.id, 1)}
                    className="w-6 h-6 rounded-md bg-[#221a10] hover:bg-[#34281a] border border-[#3e3221] text-white font-black text-xs flex items-center justify-center active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
