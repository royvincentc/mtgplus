import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameBoard } from '../components/GameBoard';
import { Chatbox } from '../components/Chatbox';
import { TokenSpawner } from '../components/TokenSpawner';
import { DeckImporter } from '../components/DeckImporter';
import { BottomBar } from '../components/BottomBar';
import { useGameStore } from '../store/useGameStore';
import { initSocket } from '../services/socket';

export const PlayRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  
  const setRoomInfo = useGameStore(state => state.setRoomInfo);
  const storeRoomId = useGameStore(state => state.roomId);

  useEffect(() => {
    if (!roomId) {
      navigate('/rooms');
      return;
    }

    // In a real app we would get the user's selected seat, but for now we default
    // or retrieve from previous state. Since we bypass Lobby, we hardcode for now
    // or rely on what Lobby set.
    if (storeRoomId !== roomId) {
       // Just set basic info if not already set by the Lobby
       setRoomInfo(roomId, 'local-user'); 
    }

    const socket = initSocket();
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // Auto join
    socket.emit('joinRoom', { roomId, username: 'Player', seatColor: 'red' });
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [roomId, navigate, setRoomInfo, storeRoomId]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      <div className="absolute top-2 right-2 z-50 flex items-center gap-2">
         <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
         <span className="text-white text-xs font-bold drop-shadow-md">{isConnected ? 'Connected' : 'Offline'}</span>
      </div>

      <div className="flex-1 relative w-full h-full">
        <GameBoard />
        <Chatbox />
        <TokenSpawner />
      </div>

      <BottomBar onImportClick={() => setShowImporter(true)} />
      
      {showImporter && <DeckImporter onClose={() => setShowImporter(false)} />}
    </div>
  );
};
