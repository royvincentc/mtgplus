import React, { useState } from 'react';
import type { CardZone } from '../store/useGameStore';
import { useGameStore } from '../store/useGameStore';
import { getCardImage } from '../services/db';

import { getSocket } from '../services/socket';

export const DeckImporter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [deckText, setDeckText] = useState('');
  const addCardLocal = useGameStore(state => state.addCardLocal);

  const handleImport = async () => {
    // Basic MTG Arena parser stub
    // Format: "1 Black Lotus"
    const lines = deckText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let xOffset = 50;
    
    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const count = parseInt(match[1], 10);
        const name = match[2];
        
        for (let i = 0; i < count; i++) {
          const instanceId = Math.random().toString(36).substring(7);
          const cardId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          
          // Try to load cached image blob URL
          const imageUrl = await getCardImage(cardId) || undefined;
          
          const cardData = {
            instanceId,
            cardId,
            name,
            zone: 'battlefield' as CardZone, 
            x: xOffset,
            y: 50,
            tapped: false,
            faceDown: false,
            counters: 0,
            ownerId: 'me',
            controllerId: 'me',
            imageUrl
          };
          
          const socket = getSocket();
          if (socket) {
              socket.emit('addCard', cardData);
              addCardLocal(cardData); // add locally too
          }
          
          xOffset += 20;
        }
      }
    }
    
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Import Deck</h2>
      <textarea
        className="w-full max-w-lg h-64 p-4 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500 mb-4"
        placeholder="Paste MTG Arena, Moxfield, or Riftbound decklist here..."
        value={deckText}
        onChange={e => setDeckText(e.target.value)}
      />
      <div className="flex gap-4">
        <button 
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 font-bold"
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 font-bold"
          onClick={handleImport}
        >
          Import
        </button>
      </div>
    </div>
  );
};
