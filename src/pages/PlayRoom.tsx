import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameBoard } from '../components/GameBoard';
import { Chatbox } from '../components/Chatbox';
import { TokenSpawner } from '../components/TokenSpawner';
import { DeckImporter } from '../components/DeckImporter';
import { BottomBar } from '../components/BottomBar';
import { RoomStaging } from '../components/RoomStaging';
import type { StagingPlayer } from '../components/RoomStaging';
import { MulliganScreen } from '../components/MulliganScreen';
import { useGameStore } from '../store/useGameStore';
import { initSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import { getCachedCardImage } from '../services/cardCache';
import { DEFAULT_DECKS } from '../services/deckParser';
import type { SavedDeck, ParsedCard } from '../services/deckParser';

export const PlayRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Game Phase: 'staging' | 'mulligan' | 'playing'
  const [phase, setPhase] = useState<'staging' | 'mulligan' | 'playing'>('staging');
  const [isConnected, setIsConnected] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [activeDeck, setActiveDeck] = useState<SavedDeck>(DEFAULT_DECKS[0]);
  
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
      setPhase('mulligan');
    });

    // Auto join room channel
    socket.emit('joinRoom', { roomId, username: userName, seatColor: 'red' });
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('gameStarted');
    };
  }, [roomId, navigate, setRoomInfo, userId, userName]);

  // When Host clicks Start in Staging: Transition to Mulligan
  const handleStartFromStaging = (stagingPlayers: StagingPlayer[]) => {
    const myStaging = stagingPlayers.find(p => p.id === userId);
    if (myStaging?.selectedDeck) {
      setActiveDeck(myStaging.selectedDeck);
    }
    setPhase('mulligan');
  };

  // When Player finishes Mulligan (Keeps hand)
  const handleMulliganComplete = async (keptHand: ParsedCard[], _bottomCards: ParsedCard[]) => {
    // 1. Spawn Commander into Command Zone
    if (activeDeck.commanderName) {
      const cmdImg = await getCachedCardImage(activeDeck.commanderName, activeDeck.commanderArt);
      addCard({
        instanceId: `cmd-${Date.now()}`,
        name: activeDeck.commanderName,
        imageUrl: cmdImg,
        ownerId: userId,
        x: 1040,
        y: 1100,
        tapped: false,
        zone: 'command_zone'
      });
    }

    // 2. Put kept cards in HAND
    for (const card of keptHand) {
      const cardImg = await getCachedCardImage(card.name);
      addCard({
        instanceId: `hand-${Date.now()}-${Math.random()}`,
        name: card.name,
        imageUrl: cardImg,
        ownerId: userId,
        x: 400 + Math.random() * 200,
        y: 1000,
        tapped: false,
        zone: 'hand'
      });
    }

    // 3. Put remainder in LIBRARY
    const remainder = activeDeck.cards.filter(c => 
      !c.isCommander && !keptHand.some(k => k.name === c.name)
    );

    for (const card of remainder) {
      for (let i = 0; i < Math.min(card.count, 4); i++) {
        const cardImg = await getCachedCardImage(card.name);
        addCard({
          instanceId: `lib-${Date.now()}-${Math.random()}`,
          name: card.name,
          imageUrl: cardImg,
          ownerId: userId,
          x: 140,
          y: 1040,
          tapped: false,
          zone: 'library'
        });
      }
    }

    // Move to live game table!
    setPhase('playing');
  };

  return (
    <div className="relative w-full h-full bg-[#0a0805] overflow-hidden flex flex-col">
      {/* Connection Indicator */}
      <div className="absolute top-2 right-2 z-50 flex items-center gap-2 bg-[#14100b]/80 border border-[#2d2417] px-3 py-1 rounded-full backdrop-blur-md">
         <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
         <span className="text-[#a09380] text-[10px] font-bold">{isConnected ? 'LIVE' : 'SYNCING'}</span>
      </div>

      {phase === 'staging' && (
        <RoomStaging 
          roomId={roomId || 'Table'}
          onStartGame={handleStartFromStaging}
          onLeaveRoom={() => navigate('/rooms')}
        />
      )}

      {phase === 'mulligan' && (
        <MulliganScreen
          deck={activeDeck}
          onComplete={handleMulliganComplete}
          onCancel={() => setPhase('staging')}
        />
      )}

      {phase === 'playing' && (
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
