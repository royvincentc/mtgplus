import React from 'react';
import { useDrag } from '@use-gesture/react';
import { useGameStore } from '../store/useGameStore';
import type { GameCard } from '../store/useGameStore';
import { getSocket } from '../services/socket';

interface CardProps {
  card: GameCard;
  onTap: (card: GameCard) => void;
  onLongPress: (card: GameCard) => void;
}

export const Card: React.FC<CardProps> = ({ card, onTap, onLongPress }) => {
  const updateCardPositionLocal = useGameStore(state => state.updateCardPositionLocal);
  
  const bind = useDrag(({ movement: [mx, my], active, tap, memo = [card.x, card.y] }) => {
    if (tap) {
      onTap(card);
      return memo;
    }
    
    if (!active) {
      const newX = memo[0] + mx;
      const newY = memo[1] + my;
      updateCardPositionLocal(card.instanceId, newX, newY, card.zone);
      
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      const socket = getSocket();
      if (socket) {
        socket.emit('moveCard', { instanceId: card.instanceId, x: newX, y: newY, zone: card.zone });
      }
    }
    return memo;
  }, { filterTaps: true });

  return (
    <div
      {...bind()}
      className={`absolute w-24 h-36 bg-gray-700 rounded-lg shadow-lg border-2 border-gray-900 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${card.tapped ? 'rotate-90' : ''}`}
      style={{
        transform: `translate3d(${card.x}px, ${card.y}px, 0) ${card.tapped ? 'rotate(90deg)' : ''}`,
        touchAction: 'none'
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress(card);
      }}
    >
      {card.imageUrl ? (
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover rounded-md pointer-events-none" />
      ) : (
        <span className="text-xs text-center p-1 pointer-events-none text-white font-bold">{card.name}</span>
      )}
    </div>
  );
};
