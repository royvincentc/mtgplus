import React, { useEffect, useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { BottomBar } from './components/BottomBar';
import { DeckImporter } from './components/DeckImporter';
import { Lobby } from './components/Lobby';
import { Chatbox } from './components/Chatbox';
import { TokenSpawner } from './components/TokenSpawner';
import { initSocket } from './services/socket';
import { useGameStore } from './store/useGameStore';

const App: React.FC = () => {
  const [showImporter, setShowImporter] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const roomId = useGameStore(state => state.roomId);

  useEffect(() => {
    const socket = initSocket();
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [roomId]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col">
      {!roomId ? (
        <Lobby />
      ) : (
        <>
          <div className="absolute top-0 left-0 right-0 h-10 bg-gray-900/90 z-30 flex items-center justify-between px-4 pointer-events-none border-b border-gray-700 shadow-md">
            <div className="text-white font-bold tracking-widest text-sm flex gap-4">
              <span>MTG+ SIMULATOR</span>
              <span className="text-gray-400">|</span>
              <span className="text-blue-400">ROOM: {roomId}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
          </div>

          <div className="flex-1 relative w-full h-full">
            <GameBoard />
            <Chatbox />
            <TokenSpawner />
          </div>

          <BottomBar onImportClick={() => setShowImporter(true)} />

          {showImporter && (
            <DeckImporter onClose={() => setShowImporter(false)} />
          )}
        </>
      )}
    </div>
  );
};

export default App;
