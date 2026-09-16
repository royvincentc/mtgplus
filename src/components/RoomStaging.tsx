import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSavedDecks } from '../services/deckParser';
import type { SavedDeck } from '../services/deckParser';
import { getSocket } from '../services/socket';
import { 
  Users, 
  Share2, 
  Copy, 
  Settings, 
  LogOut, 
  CheckCircle, 
  Play, 
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface StagingPlayer {
  id: string;
  name: string;
  isHost: boolean;
  selectedDeck?: SavedDeck;
  d20Roll?: number;
  turnOrder?: number;
  isReady: boolean;
  seatIndex: number;
}

interface RoomStagingProps {
  roomId: string;
  onStartGame: (players: StagingPlayer[]) => void;
  onLeaveRoom: () => void;
}

export const RoomStaging: React.FC<RoomStagingProps> = ({ roomId, onStartGame, onLeaveRoom }) => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Roy Codiñera';
  const userId = user?.id || 'local-user';

  const [players, setPlayers] = useState<StagingPlayer[]>([
    {
      id: userId,
      name: userName,
      isHost: true,
      isReady: false,
      seatIndex: 0
    }
  ]);

  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [selectedDeckModalOpen, setSelectedDeckModalOpen] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceNumber, setDiceNumber] = useState(20);
  const [copiedCode, setCopiedCode] = useState(false);

  const [activities, setActivities] = useState<string[]>([
    `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${userName} joined the room.`
  ]);

  const maxSeats = 2; // Can be parsed from search params or room metadata

  useEffect(() => {
    setSavedDecks(getSavedDecks());

    const socket = getSocket();
    if (!socket) return;

    const handlePlayerJoined = (data: any) => {
      setPlayers(prev => {
        if (prev.some(p => p.id === data.id)) return prev;
        return [...prev, {
          id: data.id,
          name: data.name || 'Opponent',
          isHost: false,
          isReady: false,
          seatIndex: prev.length
        }];
      });
      setActivities(prev => [
        `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${data.name || 'Opponent'} joined the room.`,
        ...prev
      ]);
    };

    const handleStagingUpdate = (updatedPlayers: StagingPlayer[]) => {
      setPlayers(updatedPlayers);
    };

    const handleGameStarted = () => {
      onStartGame(players);
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('stagingUpdate', handleStagingUpdate);
    socket.on('gameStarted', handleGameStarted);

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('stagingUpdate', handleStagingUpdate);
      socket.off('gameStarted', handleGameStarted);
    };
  }, [onStartGame, players]);

  // Handle deck selection
  const handleSelectDeck = (deck: SavedDeck) => {
    setPlayers(prev => {
      const updated = prev.map(p => {
        if (p.id === userId) {
          return { ...p, selectedDeck: deck, isReady: false };
        }
        return p;
      });
      getSocket()?.emit('updateStaging', updated);
      return updated;
    });

    setActivities(prev => [
      `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${userName} selected deck: ${deck.name}.`,
      ...prev
    ]);
    setSelectedDeckModalOpen(false);

    // Prompt to roll dice next!
    setTimeout(() => {
      setShowDiceModal(true);
    }, 400);
  };

  // Handle D20 roll
  const handleRollDice = () => {
    setIsRolling(true);

    let counter = 0;
    const interval = setInterval(() => {
      setDiceNumber(Math.floor(Math.random() * 20) + 1);
      counter++;
      if (counter > 14) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 20) + 1;
        setDiceNumber(finalRoll);
        setIsRolling(false);

        // Update player roll & ready state
        setTimeout(() => {
          setPlayers(prev => {
            const updated = prev.map(p => {
              if (p.id === userId) {
                return { 
                  ...p, 
                  d20Roll: finalRoll, 
                  isReady: true,
                  turnOrder: 1 // Default or sorted
                };
              }
              return p;
            });

            // Sort turn orders
            const withRolls = updated.filter(p => p.d20Roll !== undefined).sort((a, b) => (b.d20Roll || 0) - (a.d20Roll || 0));
            withRolls.forEach((p, idx) => { p.turnOrder = idx + 1; });

            getSocket()?.emit('updateStaging', updated);
            return updated;
          });

          setActivities(prev => [
            `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${userName} rolled ${finalRoll}.`,
            ...prev
          ]);
          setShowDiceModal(false);
        }, 500);
      }
    }, 60);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Room link copied to clipboard!');
  };

  const myPlayer = players.find(p => p.id === userId);
  const allReady = players.length >= 1 && players.every(p => p.isReady && p.selectedDeck);

  const handleStart = () => {
    const socket = getSocket();
    if (socket) socket.emit('startGame', { roomId });
    onStartGame(players);
  };

  return (
    <div className="w-full h-full bg-[#0a0805] text-[#f5f0e6] relative flex flex-col overflow-y-auto">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center filter blur-xl"
        style={{
          backgroundImage: myPlayer?.selectedDeck?.commanderArt 
            ? `url(${myPlayer.selectedDeck.commanderArt})` 
            : `url('https://cards.scryfall.io/art_crop/front/b/c/bc4a65de-23b5-48f0-b8b7-94608eaced3e.jpg')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0805] via-[#0a0805]/85 to-[#120f0b]/90 pointer-events-none" />

      {/* Main Container matching screenshot media_1789542643706.png & media_1789543288468.png */}
      <div className="relative z-10 max-w-7xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {roomId}
            </h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => alert('Invite link: ' + window.location.href)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#f3d37a] border border-[#c5a059]/40 text-xs font-bold transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              Invite friends
            </button>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b150e] hover:bg-[#282015] text-[#ded5c7] border border-[#3e3221] text-xs font-bold transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedCode ? 'Copied!' : 'Copy code'}
            </button>

            <button
              onClick={handleShareLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b150e] hover:bg-[#282015] text-[#ded5c7] border border-[#3e3221] text-xs font-bold transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share link
            </button>

            <button
              onClick={() => alert('Room setup options')}
              className="p-2 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold transition-all"
              title="Setup"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onLeaveRoom}
              className="p-2 rounded-xl bg-[#1b150e] hover:bg-red-950/50 text-[#8c806f] hover:text-red-400 border border-[#3e3221] hover:border-red-800/40 transition-all"
              title="Leave Room"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* Left Column: Player Count & Activity Feed */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                PLAYERS ({players.length}/{maxSeats})
              </h2>
              <p className="text-xs text-[#8c806f] mt-0.5">
                Choose your deck and get ready before starting.
              </p>
            </div>

            {/* Activity Box (Screenshot media_1789542643706.png) */}
            <div className="bg-[#120f0b]/90 border border-[#2d2417] rounded-2xl p-4 backdrop-blur-md shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8c806f] block mb-2">
                Activity
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activities.map((act, i) => (
                  <div key={i} className="text-xs text-[#c5bba8] leading-relaxed border-b border-[#231b12] pb-1 font-mono">
                    {act}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Player Slots Grid */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Render Players */}
              {players.map((p) => {
                const isLocal = p.id === userId;
                return (
                  <div
                    key={p.id}
                    className="relative h-64 rounded-3xl overflow-hidden border border-[#c5a059]/40 bg-[#14100b] p-6 flex flex-col justify-between shadow-2xl group transition-all"
                  >
                    {/* Background Art of selected Commander (Screenshot media_1789543288468.png) */}
                    {p.selectedDeck?.commanderArt && (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"
                          style={{ backgroundImage: `url(${p.selectedDeck.commanderArt})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#120f0b] via-[#120f0b]/70 to-transparent" />
                      </>
                    )}

                    {/* Top Row Badges */}
                    <div className="relative z-10 flex items-center justify-between">
                      {/* D20 Roll & Turn order badge (Screenshot media_1789543288468.png) */}
                      {p.d20Roll !== undefined ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-[#c5a059]/50 text-xs font-black shadow-md">
                          <span className="text-[10px] text-[#a09380] uppercase">Turn #{p.turnOrder || 1}</span>
                          <span className="text-[#e5c158] ml-1">D20 <strong className="text-white text-sm">{p.d20Roll}</strong></span>
                        </div>
                      ) : (
                        <div />
                      )}

                      {/* Host & Ready Badges */}
                      <div className="flex items-center gap-1.5">
                        {p.isHost && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#292014] text-[#e5c158] border border-[#c5a059]/40">
                            HOST
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                          p.isReady 
                            ? 'bg-emerald-950/70 border border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                            : 'bg-black/60 border border-[#3d3222] text-[#8c806f]'
                        }`}>
                          {p.isReady ? 'Ready' : 'Deck pending'}
                        </span>
                      </div>
                    </div>

                    {/* Center: Player Avatar & Name */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#e5c158] to-[#9a7328] border-2 border-white/40 flex items-center justify-center text-black font-black text-2xl shadow-xl mb-2">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-base font-black text-white drop-shadow-md">
                        {p.name}
                      </h3>

                      {p.selectedDeck && (
                        <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#1b150e]/90 border border-[#c5a059]/40 text-[10px] font-bold text-[#e5c158]">
                          {p.selectedDeck.bracket || 'Bracket 3'}
                        </span>
                      )}
                    </div>

                    {/* Bottom: Deck Selector Button */}
                    <div className="relative z-10">
                      {isLocal ? (
                        <button
                          onClick={() => setSelectedDeckModalOpen(true)}
                          className="w-full py-2 px-3.5 rounded-xl bg-[#0a0806]/85 hover:bg-[#16120c] border border-[#3e3221] hover:border-[#c5a059] flex items-center justify-between text-xs font-bold text-[#ded5c7] transition-all"
                        >
                          <span className="truncate max-w-[170px]">
                            {p.selectedDeck ? p.selectedDeck.name : 'Select a deck'}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-[#c5a059]" />
                        </button>
                      ) : (
                        <div className="w-full py-2 px-3.5 rounded-xl bg-[#0a0806]/60 border border-[#2d2417] text-center text-xs font-bold text-[#8c806f]">
                          {p.selectedDeck ? p.selectedDeck.name : 'Choosing deck...'}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}

              {/* Render Empty Slots */}
              {Array.from({ length: Math.max(0, maxSeats - players.length) }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-64 rounded-3xl border-2 border-dashed border-[#2d2417] bg-[#120f0b]/40 flex flex-col items-center justify-center p-6 text-center hover:border-[#c5a059]/30 transition-all cursor-pointer"
                  onClick={handleCopyCode}
                >
                  <div className="w-12 h-12 rounded-full bg-[#1b150e] border border-[#3e3221] flex items-center justify-center text-[#8c806f] mb-3">
                    <Users className="w-5 h-5 text-[#c5a059]" />
                  </div>
                  <span className="text-sm font-bold text-[#ded5c7]">+ Open slot</span>
                  <p className="text-[11px] text-[#756755] mt-1">Click to copy invite code</p>
                </div>
              ))}

            </div>

            {/* Bottom Controls Bar (Screenshot media_1789543288468.png) */}
            <div className="flex items-center justify-end gap-4 mt-8 pt-4 border-t border-[#2d2417]">
              {/* Ready Status indicator */}
              <div className="px-4 py-1.5 rounded-full bg-black/70 border border-[#3d3222] text-xs font-bold text-[#8c806f]">
                {allReady ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> All players ready
                  </span>
                ) : (
                  <span>Waiting for decks and rolls</span>
                )}
              </div>

              {/* Start Button */}
              <button
                onClick={handleStart}
                disabled={!allReady && players.length > 1}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#c5a059]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                Start
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Select Deck Modal */}
      {selectedDeckModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#14100b] border border-[#c5a059]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-white mb-1">Select your Commander Deck</h3>
            <p className="text-xs text-[#8c806f] mb-4">Choose from your saved decks or default precons.</p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 mb-6">
              {savedDecks.map(deck => (
                <div
                  key={deck.id}
                  onClick={() => handleSelectDeck(deck)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#1b150e] hover:bg-[#261e14] border border-[#3d3222] hover:border-[#c5a059] cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg bg-cover bg-center border border-[#c5a059]/30 shrink-0"
                      style={{ backgroundImage: `url(${deck.commanderArt || 'https://cards.scryfall.io/art_crop/front/7/e/7e27fa5e-1a5a-44a4-a5eb-2b4639e72844.jpg'})` }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#e5c158] transition-colors">{deck.name}</h4>
                      <p className="text-xs text-[#8c806f]">{deck.commanderName} • {deck.totalCards} cards</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#292014] text-[#e5c158] border border-[#c5a059]/30">
                    {deck.bracket || 'Bracket 3'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDeckModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#1c160e] text-[#8c806f] hover:text-white font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* D20 Roll Dice Modal matching Screenshot media_1789543272777.png */}
      {showDiceModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#14100b] border border-[#c5a059]/50 rounded-3xl p-8 max-w-md w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] text-center animate-in zoom-in-95 duration-150 relative">
            
            <h3 className="text-xl font-black text-white mb-1">Roll dice</h3>
            <p className="text-xs text-[#8c806f] mb-8">This roll sets your turn order.</p>

            {/* Purple 20-sided die graphic with number (Screenshot media_1789543272777.png) */}
            <div className="flex justify-center mb-8 relative">
              <motion.div
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.15, 0.95, 1] } : {}}
                transition={{ repeat: isRolling ? Infinity : 0, duration: 0.5 }}
                className="w-28 h-28 relative flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              >
                {/* 20-sided Die SVG Polygon */}
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  {/* Outer hexagon */}
                  <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="#581c87" stroke="#a855f7" strokeWidth="2.5" />
                  {/* Inner facets */}
                  <polygon points="50,5 50,50 10,28" fill="#6b21a8" stroke="#c084fc" strokeWidth="1" />
                  <polygon points="50,5 90,28 50,50" fill="#7e22ce" stroke="#c084fc" strokeWidth="1" />
                  <polygon points="10,28 50,50 30,83" fill="#4c1d95" stroke="#a855f7" strokeWidth="1" />
                  <polygon points="90,28 50,50 70,83" fill="#581c87" stroke="#a855f7" strokeWidth="1" />
                  <polygon points="50,50 30,83 70,83" fill="#3b0764" stroke="#c084fc" strokeWidth="1.5" />
                  <polygon points="50,95 30,83 70,83" fill="#2e1065" stroke="#a855f7" strokeWidth="1" />
                </svg>

                {/* Big Number in Center */}
                <span className="absolute font-black text-3xl text-white drop-shadow-md select-none">
                  {diceNumber}
                </span>
              </motion.div>
            </div>

            {/* Warning Box (Screenshot media_1789543272777.png) */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#261e14] border border-[#c5a059]/40 text-left mb-8 shadow-inner">
              <div className="w-6 h-6 rounded-full bg-[#c5a059] flex items-center justify-center text-black font-black text-xs shrink-0 mt-0.5">
                !
              </div>
              <p className="text-xs text-[#f5f0e6] font-bold leading-relaxed">
                After rolling, your deck selection will be locked and cannot be changed.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isRolling}
                onClick={() => setShowDiceModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1c160e] hover:bg-[#261e14] text-[#8c806f] hover:text-white text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRolling}
                onClick={handleRollDice}
                className="px-8 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c5a059]/25"
              >
                {isRolling ? 'Rolling...' : 'Roll'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
