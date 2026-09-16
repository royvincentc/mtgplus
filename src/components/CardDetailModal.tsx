import React from 'react';
import type { GameCard } from '../store/useGameStore';
import { X } from 'lucide-react';

interface CardDetailModalProps {
  card: GameCard;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button 
        className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full text-white"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <X size={24} />
      </button>
      
      <div className="max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.name} className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl" />
        ) : (
          <div className="w-[80vw] h-[60vh] bg-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{card.name}</span>
          </div>
        )}
        
        <div className="mt-4 bg-gray-800 p-4 rounded-lg w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-2">{card.name}</h2>
          {/* Add more card text/details here if available */}
        </div>
      </div>
    </div>
  );
};
