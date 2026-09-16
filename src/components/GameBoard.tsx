import React, { useState } from 'react';
import { usePinch, useDrag } from '@use-gesture/react';
import { useGameStore } from '../store/useGameStore';
import type { GameCard } from '../store/useGameStore';
import { Card } from './Card';
import { CardDetailModal } from './CardDetailModal';
import { BattlefieldContextMenu } from './BattlefieldContextMenu';
import { TokenSpawner } from './TokenSpawner';
import { getSocket } from '../services/socket';
import { 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { generateOfflineCardArt } from '../services/cardCache';

export const GameBoard: React.FC = () => {
  const cards = useGameStore(state => state.cards);
  const players = useGameStore(state => state.players);
  const myPlayerId = useGameStore(state => state.myPlayerId);
  const toggleCardTapLocal = useGameStore(state => state.toggleCardTapLocal);
  const updatePlayerLifeLocal = useGameStore(state => state.updatePlayerLifeLocal);
  const drawCardLocal = useGameStore(state => state.drawCardLocal);
  const untapAllLocal = useGameStore(state => state.untapAllLocal);
  const addChatMessageLocal = useGameStore(state => state.addChatMessageLocal);

  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [activePlayerTurn, setActivePlayerTurn] = useState<string>(myPlayerId);
  const [currentPhase, setCurrentPhase] = useState<'Untap' | 'Upkeep' | 'Draw' | 'Main 1' | 'Combat' | 'Main 2' | 'End'>('Untap');

  // View mode: 'focused' (Screenshot 4) or 'birdseye' (Tabletop view)
  const [viewMode, setViewMode] = useState<'focused' | 'birdseye'>('focused');

  // Zoom/Pan for birdseye mode
  const [{ x, y, scale }, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  // Context Menu state (Screenshot 5)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [showTokenSpawner, setShowTokenSpawner] = useState(false);
  const [showManaPool, setShowManaPool] = useState(false);
  const [manaPool, setManaPool] = useState({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 });

  const myPlayer = players[myPlayerId] || {
    id: myPlayerId,
    name: 'Roy Codiñera',
    seatColor: 'red',
    life: 40,
    commanderDamage: {},
    poison: 0
  };

  const opponentPlayer = Object.values(players).find(p => p.id !== myPlayerId) || {
    id: 'opponent',
    name: 'Roy C',
    seatColor: 'yellow',
    life: 40,
    commanderDamage: {},
    poison: 0
  };

  // Handlers
  const handleLifeChange = (playerId: string, delta: number) => {
    updatePlayerLifeLocal(playerId, delta);
    getSocket()?.emit('updateLife', { playerId, delta });
  };

  const handleCardTap = (card: GameCard) => {
    toggleCardTapLocal(card.instanceId);
    getSocket()?.emit('toggleCardTap', card.instanceId);
  };

  const handleCardLongPress = (card: GameCard) => {
    setSelectedCard(card);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  };

  const handlePassTurn = () => {
    const nextPlayerId = activePlayerTurn === myPlayerId ? opponentPlayer.id : myPlayerId;
    setActivePlayerTurn(nextPlayerId);
    if (nextPlayerId === myPlayerId) {
      setCurrentTurn(t => t + 1);
    }
    setCurrentPhase('Untap');

    addChatMessageLocal({
      id: Date.now().toString(),
      sender: 'System',
      text: `Passed turn to ${nextPlayerId === myPlayerId ? myPlayer.name : opponentPlayer.name}.`,
      isSystem: true
    });
  };

  // Right-click listener on battlefield
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  };

  // Close context menu on click
  const handleBoardClick = () => {
    if (contextMenu.visible) setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Filter cards by zone
  const battlefieldCards = cards.filter(c => c.zone === 'battlefield');
  const handCards = cards.filter(c => c.zone === 'hand' && c.ownerId === myPlayerId);
  const libraryCards = cards.filter(c => c.zone === 'library' && c.ownerId === myPlayerId);
  const commanderCards = cards.filter(c => c.zone === 'command_zone' || (c.zone === 'battlefield' && c.name.includes('Dragon') || c.name.includes('Krenko') || c.name.includes('Gishath')));
  const graveyardCards = cards.filter(c => c.zone === 'graveyard' && c.ownerId === myPlayerId);
  const exileCards = cards.filter(c => c.zone === 'exile' && c.ownerId === myPlayerId);

  // Gesture bindings for birdseye pan/zoom
  const bindDrag = useDrag(({ movement: [dx, dy], memo = [x, y], tap }) => {
    if (tap || viewMode !== 'birdseye') return memo;
    setTransform(t => ({ ...t, x: memo[0] + dx, y: memo[1] + dy }));
    return memo;
  }, { filterTaps: true });

  const bindPinch = usePinch(({ offset: [s] }) => {
    if (viewMode === 'birdseye') {
      setTransform(t => ({ ...t, scale: Math.max(0.4, Math.min(s, 3)) }));
    }
  });

  return (
    <div 
      className="relative w-full h-full bg-[#0d0906] text-[#f5f0e6] overflow-hidden flex flex-col select-none"
      onClick={handleBoardClick}
      onContextMenu={handleContextMenu}
    >
      
      {/* 1. TOP BAR matching Screenshot media_1789543497159.png */}
      <div 
        className="h-14 bg-[#14100b] border-b border-[#2d2417] flex items-center justify-between px-3 sm:px-6 z-40 shrink-0 shadow-md"
        onPointerDown={e => e.stopPropagation()}
      >
        {/* Left: Player Info & Life Stepper */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#e5c158] to-[#9a7328] border border-white/40 flex items-center justify-center text-black font-black text-sm">
            {myPlayer.name.charAt(0)}
          </div>
          <div>
            <span className="text-xs font-black text-white block leading-none">{myPlayer.name}</span>
            <span className="text-[10px] text-[#c5a059] font-bold">krenko b3</span>
          </div>

          {/* Life Stepper (Screenshot media_1789543497159.png) */}
          <div className="flex items-center gap-1.5 ml-2 bg-[#0c0906] border border-[#3e3221] px-2.5 py-1 rounded-xl">
            <button
              onClick={() => handleLifeChange(myPlayer.id, -1)}
              className="w-5 h-5 rounded hover:bg-[#251e14] text-white font-black text-xs flex items-center justify-center"
            >
              −
            </button>
            <span className="text-base font-black text-[#f3d37a] min-w-[28px] text-center">
              {myPlayer.life}
            </span>
            <button
              onClick={() => handleLifeChange(myPlayer.id, 1)}
              className="w-5 h-5 rounded hover:bg-[#251e14] text-white font-black text-xs flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Center: Turn Tracker & Phases (Screenshot media_1789543497159.png) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 bg-[#0a0806] border border-[#3e3221] px-3.5 py-1 rounded-2xl text-xs">
            <span className="font-black text-white">
              {activePlayerTurn === myPlayer.id ? myPlayer.name : opponentPlayer.name}
              <span className="text-[#e5c158] ml-1.5 font-mono">TURN {currentTurn}</span>
            </span>
            <span className="text-[10px] text-[#8c806f] font-bold">
              {activePlayerTurn === myPlayer.id ? opponentPlayer.name : myPlayer.name} IN 1
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => { untapAllLocal(myPlayer.id); setCurrentPhase('Untap'); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                currentPhase === 'Untap'
                  ? 'bg-[#292014] border-[#c5a059] text-[#f3d37a]'
                  : 'bg-[#1b150e] hover:bg-[#261e14] text-[#a09380] hover:text-white border-[#3e3221]'
              }`}
            >
              Untap
            </button>
            <button
              onClick={() => setCurrentPhase('Upkeep')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                currentPhase === 'Upkeep'
                  ? 'bg-[#292014] border-[#c5a059] text-[#f3d37a]'
                  : 'bg-[#1b150e] hover:bg-[#261e14] text-[#a09380] hover:text-white border-[#3e3221]'
              }`}
            >
              Upkeep
            </button>
            <button
              onClick={handlePassTurn}
              className="flex items-center gap-1 px-3.5 py-1 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#c5a059]/20"
            >
              Pass turn
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: View Mode Toggle, Game Log & Chat */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'focused' ? 'birdseye' : 'focused')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              viewMode === 'birdseye' 
                ? 'bg-[#c5a059] text-black border-[#c5a059]' 
                : 'bg-[#1b150e] text-[#a09380] border-[#3e3221] hover:text-white'
            }`}
            title="Toggle Birds-eye / Focused Table"
          >
            {viewMode === 'birdseye' ? 'Table View' : 'Playmat View'}
          </button>
        </div>

      </div>

      {/* 2. MAIN BATTLEFIELD AREA (Screenshot media_1789543497159.png) */}
      <div 
        className="flex-1 relative overflow-hidden flex"
        {...(viewMode === 'birdseye' ? bindDrag() : {})}
        {...(viewMode === 'birdseye' ? bindPinch() : {})}
      >
        
        {/* The Player's Playmat (Red Textured Tabletop) */}
        <div 
          className="flex-1 relative h-full w-full bg-[#3d120d] bg-gradient-to-br from-[#4a1710] via-[#2d0e0a] to-[#1a0705] overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(ellipse at center, rgba(160, 40, 25, 0.4) 0%, rgba(30, 8, 5, 0.9) 100%), url('https://www.transparenttextures.com/patterns/black-linen.png')`,
            backgroundBlendMode: 'overlay',
            ...(viewMode === 'birdseye' ? {
              transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
              transformOrigin: 'center center'
            } : {})
          }}
        >
          {/* Render Battlefield Cards */}
          {battlefieldCards.map(card => (
            <Card
              key={card.instanceId}
              card={card}
              onTap={handleCardTap}
              onLongPress={handleCardLongPress}
            />
          ))}

          {/* Mana Pool Overlay */}
          {showManaPool && (
            <div 
              className="absolute top-4 left-4 z-30 bg-[#120f0a]/90 backdrop-blur-md border border-[#c5a059]/40 rounded-2xl p-3 shadow-2xl flex items-center gap-3"
              onPointerDown={e => e.stopPropagation()}
            >
              {['W', 'U', 'B', 'R', 'G', 'C'].map((m) => (
                <div key={m} className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-[#c5a059]">{m}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => setManaPool(prev => ({ ...prev, [m]: Math.max(0, (prev as any)[m] - 1) }))}
                      className="w-5 h-5 rounded bg-[#221a10] text-xs font-black"
                    >−</button>
                    <span className="font-mono text-sm font-black text-white w-4 text-center">
                      {(manaPool as any)[m]}
                    </span>
                    <button
                      onClick={() => setManaPool(prev => ({ ...prev, [m]: (prev as any)[m] + 1 }))}
                      className="w-5 h-5 rounded bg-[#221a10] text-xs font-black"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. PLAYER HAND AREA (Screenshot media_1789543497159.png) */}
          <div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto"
            onPointerDown={e => e.stopPropagation()}
          >
            {/* Hand Counter Pill */}
            <span className="text-[10px] font-bold text-[#c5a059] bg-[#120f0b]/90 border border-[#3e3221] px-3 py-0.5 rounded-full mb-1 shadow-md">
              {handCards.length} cards
            </span>

            {/* Overlapping Fanned Hand */}
            <div className="flex items-center justify-center -space-x-14 hover:space-x-2 transition-all p-2 duration-200">
              {handCards.map(card => (
                <div
                  key={card.instanceId}
                  onClick={() => handleCardTap(card)}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); handleCardLongPress(card); }}
                  className="w-24 sm:w-28 aspect-[5/7] rounded-xl overflow-hidden shadow-2xl border-2 border-[#3e3221] hover:border-[#c5a059] hover:-translate-y-6 hover:scale-110 transition-all cursor-pointer bg-[#14100b] shrink-0"
                >
                  <img
                    src={card.imageUrl || generateOfflineCardArt(card.name)}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4. BOTTOM RIGHT ZONES matching Screenshot media_1789543497159.png */}
          <div 
            className="absolute bottom-3 right-3 z-20 flex items-end gap-2 pointer-events-auto"
            onPointerDown={e => e.stopPropagation()}
          >
            {/* LIBRARY ZONE */}
            <div 
              onClick={() => drawCardLocal(myPlayerId)}
              className="w-20 sm:w-24 aspect-[5/7] rounded-xl border-2 border-dashed border-[#c5a059]/40 bg-[#14100b] hover:border-[#c5a059] flex flex-col items-center justify-between p-1.5 cursor-pointer shadow-2xl group transition-all"
              title="Click to Draw"
            >
              <span className="text-[9px] font-black uppercase text-[#c5a059] tracking-wider">
                LIBRARY ({libraryCards.length})
              </span>
              <div className="w-full flex-1 rounded-lg overflow-hidden bg-[#241a10] flex items-center justify-center border border-[#3e3221]">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/en/a/aa/Magic_the_gathering-card_back.jpg" 
                  alt="Back" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = generateOfflineCardArt('MTG Card Back');
                  }}
                />
              </div>
            </div>

            {/* COMMANDER ZONE */}
            <div className="w-20 sm:w-24 aspect-[5/7] rounded-xl border-2 border-dashed border-red-500/50 bg-[#14100b] flex flex-col items-center justify-between p-1.5 shadow-2xl">
              <span className="text-[8px] font-black uppercase text-red-400 tracking-wider">
                COMMAND ZONE ({commanderCards.length})
              </span>
              <div className="w-full flex-1 rounded-lg overflow-hidden border border-red-900/60 bg-[#2b100c]">
                {commanderCards[0] ? (
                  <img
                    src={commanderCards[0].imageUrl || generateOfflineCardArt(commanderCards[0].name)}
                    alt="Commander"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-red-500 font-bold">
                    Commander
                  </div>
                )}
              </div>
            </div>

            {/* GRAVEYARD ZONE */}
            <div className="w-20 sm:w-24 aspect-[5/7] rounded-xl border-2 border-dashed border-[#3e3221] bg-[#14100b]/80 flex flex-col items-center justify-between p-1.5 shadow-xl">
              <span className="text-[9px] font-black uppercase text-[#8c806f] tracking-wider">
                GRAVEYARD ({graveyardCards.length})
              </span>
              <div className="w-full flex-1 rounded-lg border border-[#251d13] flex items-center justify-center text-xs font-bold text-[#5a5042]">
                0
              </div>
            </div>

            {/* EXILE ZONE */}
            <div className="w-20 sm:w-24 aspect-[5/7] rounded-xl border-2 border-dashed border-[#3e3221] bg-[#14100b]/80 flex flex-col items-center justify-between p-1.5 shadow-xl">
              <span className="text-[9px] font-black uppercase text-[#8c806f] tracking-wider">
                EXILE ({exileCards.length})
              </span>
              <div className="w-full flex-1 rounded-lg border border-[#251d13] flex items-center justify-center text-xs font-bold text-[#5a5042]">
                0
              </div>
            </div>
          </div>

        </div>

        {/* 5. OPPONENT SIDE BOX matching Screenshot media_1789543497159.png */}
        <div 
          className="w-64 sm:w-72 bg-[#120f0a] border-l border-[#2d2417] flex flex-col justify-between shrink-0 shadow-2xl z-30"
          onPointerDown={e => e.stopPropagation()}
        >
          {/* Opponent Card Preview Box */}
          <div className="p-4 border-b border-[#2d2417]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-black text-white">{opponentPlayer.name}</h4>
                <span className="text-xs font-bold text-[#c5a059]">gishath</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#0c0906] border border-[#3e3221] text-[#f3d37a] font-black text-sm">
                {opponentPlayer.life}
              </span>
            </div>

            {/* Opponent Mini Battlefield Box */}
            <div className="h-44 rounded-2xl border border-[#3e3221] bg-[#18130d] relative overflow-hidden flex flex-col items-center justify-center p-3 text-center">
              <span className="text-[10px] text-[#8c806f] font-bold uppercase tracking-wider mb-2">
                Opponent Battlefield
              </span>
              <p className="text-xs text-[#ded5c7]">Gishath, Sun's Avatar</p>
              <div className="w-16 h-20 rounded-lg overflow-hidden border border-[#3e3221] mt-2 shadow-lg">
                <img
                  src="https://cards.scryfall.io/art_crop/front/b/c/bc4a65de-23b5-48f0-b8b7-94608eaced3e.jpg"
                  alt="Gishath"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = generateOfflineCardArt("Gishath, Sun's Avatar");
                  }}
                />
              </div>
            </div>

            {/* Opponent Stats Counters (Hand, Library, Grave, Exile) */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#251d13] text-center">
              <div>
                <span className="text-[9px] text-[#756755] font-bold uppercase block">Hand</span>
                <span className="text-xs font-black text-white">6</span>
              </div>
              <div>
                <span className="text-[9px] text-[#756755] font-bold uppercase block">Lib</span>
                <span className="text-xs font-black text-white">93</span>
              </div>
              <div>
                <span className="text-[9px] text-[#756755] font-bold uppercase block">Grave</span>
                <span className="text-xs font-black text-white">0</span>
              </div>
              <div>
                <span className="text-[9px] text-[#756755] font-bold uppercase block">Exile</span>
                <span className="text-xs font-black text-white">0</span>
              </div>
            </div>
          </div>

          {/* Activity Log in Sidebar */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-[#a09380] space-y-1">
            <div className="text-[#c5a059] font-bold mb-2">✦ Match Feed</div>
            <div>15:23 {opponentPlayer.name} took a mulligan.</div>
            <div>15:24 {opponentPlayer.name} kept their hand.</div>
            <div className="text-emerald-400">15:25 Game officially started!</div>
          </div>
        </div>

      </div>

      {/* Floating Action Button for Mobile (Screenshot media_1789543662535.png context menu trigger) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setContextMenu({ x: 20, y: window.innerHeight - 260, visible: true });
        }}
        className="fixed bottom-20 left-4 z-40 w-11 h-11 rounded-2xl bg-[#c5a059] hover:bg-[#d4af37] text-black shadow-2xl flex items-center justify-center font-black transition-transform active:scale-95"
        title="Battlefield Actions (Mobile Menu)"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {/* Context Menu (Screenshot media_1789543662535.png) */}
      <BattlefieldContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        onCreateToken={() => setShowTokenSpawner(true)}
        onRollDice={() => {
          const roll = Math.floor(Math.random() * 20) + 1;
          alert(`🎲 You rolled a ${roll} (D20)`);
        }}
        onToggleManaPool={() => setShowManaPool(!showManaPool)}
        onUntapAll={() => untapAllLocal(myPlayer.id)}
        onDrawCard={() => drawCardLocal(myPlayer.id)}
      />

      {/* Token Spawner Drawer */}
      {showTokenSpawner && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <TokenSpawner />
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

    </div>
  );
};
