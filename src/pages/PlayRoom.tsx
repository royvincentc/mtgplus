import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameBoard } from '../components/GameBoard';
import { Chatbox } from '../components/Chatbox';
import { TokenSpawner } from '../components/TokenSpawner';
import { DeckImporter } from '../components/DeckImporter';
import { BottomBar } from '../components/BottomBar';
import { RoomStaging } from '../components/RoomStaging';
import type { StagingPlayer } from '../components/RoomStaging';
import { useGameStore } from '../store/useGameStore';
import { initSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import { getCachedCardImage } from '../services/cardCache';

export const PlayRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  
  const setRoomInfo = useGameStore(state => state.setRoomInfo);
  const addCard = useGameStore(state => state.addCard);

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Roy Codiñera';
  const userId = user?.id || 'local-user';

  useEffect(() => {
    if (!roomId) {
      navigate('/rooms');
      return;
    }

    setRoomInfo(roomId, userId);

    const socket = initSocket();
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // Listen for remote start game
    socket.on('gameStarted', () => {
      setIsGameStarted(true);
    });

    // Auto join room channel
    socket.emit('joinRoom', { roomId, username: userName, seatColor: 'red' });
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('gameStarted');
    };
  }, [roomId, navigate, setRoomInfo, userId, userName]);

  // When game starts from Staging: load the selected deck cards into the library zone!
  const handleStartGame = async (stagingPlayers: StagingPlayer[]) => {
    setIsGameStarted(true);
    const myStaging = stagingPlayers.find(p => p.id === userId);

    if (myStaging?.selectedDeck) {
      const deck = myStaging.selectedDeck;
      let cardX = 140; // library position on red playmat
      let cardY = 1040;

      // Spawn Commander first (into Command Zone)
      if (deck.commanderName) {
        const cmdImg = await getCachedCardImage(deck.commanderName, deck.commanderArt);
        addCard({
          instanceId: `cmd-${Date.now()}`,
          name: deck.commanderName,
          imageUrl: cmdImg,
          ownerId: userId,
          x: 1040,
          y: 1100, // Command zone
          tapped: false,
          zone: 'battlefield'
        });
      }

      // Spawn Library cards
      for (const card of deck.cards) {
        if (card.isCommander) continue;
        for (let i = 0; i < Math.min(card.count, 4); i++) {
          const cardImg = await getCachedCardImage(card.name);
          addCard({
            instanceId: `card-${Date.now()}-${Math.random()}`,
            name: card.name,
            imageUrl: cardImg,
            ownerId: userId,
            x: cardX,
            y: cardY,
            tapped: false,
            zone: 'library'
          });
        }
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0a0805] overflow-hidden flex flex-col">
      {/* Connection Indicator */}
      <div className="absolute top-2 right-2 z-50 flex items-center gap-2 bg-[#14100b]/80 border border-[#2d2417] px-3 py-1 rounded-full backdrop-blur-md">
         <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
         <span className="text-[#a09380] text-[10px] font-bold">{isConnected ? 'LIVE' : 'SYNCING'}</span>
      </div>

      {!isGameStarted ? (
        <RoomStaging 
          roomId={roomId || 'Table'}
          onStartGame={handleStartGame}
          onLeaveRoom={() => navigate('/rooms')}
        />
      ) : (
        <div className="flex-1 relative w-full h-full flex flex-col">
          <div className="flex-1 relative w-full h-full">
            <GameBoard />
            <Chatbox />
            <TokenSpawner />
          </div>

          <BottomBar 
            onImportClick={() => setShowImporter(true)} 
          />
          
          {showImporter && <DeckImporter onClose={() => setShowImporter(false)} />}
        </div>
      )}
    </div>
  );
};
