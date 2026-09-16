import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { SavedDeck, ParsedCard } from '../services/deckParser';
import { generateOfflineCardArt } from '../services/cardCache';
import { CheckCircle, X } from 'lucide-react';

interface MulliganScreenProps {
  deck: SavedDeck;
  onComplete: (keptHand: ParsedCard[], bottomCards: ParsedCard[]) => void;
  onCancel: () => void;
}

export const MulliganScreen: React.FC<MulliganScreenProps> = ({ deck, onComplete, onCancel }) => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Roy C';

  const [mulliganCount, setMulliganCount] = useState(0);
  const [hand, setHand] = useState<ParsedCard[]>(() => drawRandomHand(deck, 7));
  const [bottomCards, setBottomCards] = useState<ParsedCard[]>([]);
  const [isWaitingOthers, setIsWaitingOthers] = useState(false);

  // First mulligan is free (London rule):
  // 0 mulligans = keep 7
  // 1 mulligan = keep 7 (free)
  // 2 mulligans = keep 7, put 1 on bottom
  // 3 mulligans = keep 7, put 2 on bottom
  const effectiveMulligans = Math.max(0, mulliganCount - 1);

  // Helper to draw random 7 cards
  function drawRandomHand(d: SavedDeck, count: number): ParsedCard[] {
    const pool = d.cards.filter(c => !c.isCommander);
    const result: ParsedCard[] = [];
    for (let i = 0; i < count; i++) {
      if (pool.length === 0) break;
      const rand = pool[Math.floor(Math.random() * pool.length)];
      result.push({ ...rand, name: rand.name });
    }
    return result;
  }

  // Handle taking a mulligan
  const handleMulligan = () => {
    const nextCount = mulliganCount + 1;
    setMulliganCount(nextCount);
    setHand(drawRandomHand(deck, 7));
    setBottomCards([]);
  };

  // Handle toggling card to bottom
  const togglePutOnBottom = (card: ParsedCard) => {
    if (bottomCards.some(c => c.name === card.name)) {
      // Remove from bottom
      setBottomCards(bottomCards.filter(c => c.name !== card.name));
    } else {
      // Add to bottom if limit not reached
      if (bottomCards.length < effectiveMulligans) {
        setBottomCards([...bottomCards, card]);
      }
    }
  };

  // Handle keep hand
  const handleKeepHand = () => {
    setIsWaitingOthers(true);
    // Simulate other players ready after 1.5s
    setTimeout(() => {
      const kept = hand.filter(h => !bottomCards.some(b => b.name === h.name));
      onComplete(kept, bottomCards);
    }, 1500);
  };

  // Waiting for other players screen (Screenshot media_1789543397428.png)
  if (isWaitingOthers) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d0906] text-[#f5f0e6] flex flex-col p-6 sm:p-10 select-none">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#8c806f] uppercase block mb-1">
              LONDON
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
              Mulligan
            </h1>
            <p className="text-xs text-cyan-400 mt-1">
              Draw 7 cards every time. When you keep, put one card on the bottom for each effective mulligan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              {userName} <span className="text-[10px] uppercase font-black ml-1">READY</span>
            </div>
            <button 
              onClick={onCancel}
              className="p-1.5 rounded-lg bg-[#1a140d] border border-[#3e3221] hover:text-white text-[#8c806f] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Spinner (Screenshot media_1789543397428.png) */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            Waiting for the other players...
          </span>
        </div>
      </div>
    );
  }

  // Active Mulligan Screen (Screenshots media_1789543359349.png & media_1789543420993.png)
  return (
    <div className="fixed inset-0 z-50 bg-[#0d0906] text-[#f5f0e6] flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#8c806f] uppercase block mb-1">
            LONDON
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
            Mulligan
          </h1>
          <p className="text-xs text-cyan-400 mt-1 max-w-xl">
            Draw 7 cards every time. When you keep, put one card on the bottom for each effective mulligan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1 rounded-xl bg-[#1b150e] border border-[#c5a059]/40 text-[#f3d37a] text-xs font-bold">
              {userName} <span className="text-[9px] uppercase font-black text-[#a09380] ml-1">DECIDING</span>
            </div>
            <button 
              onClick={onCancel}
              className="p-1.5 rounded-lg bg-[#1a140d] border border-[#3e3221] hover:text-white text-[#8c806f] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold">
              First mulligan is free
            </span>
            <span className="text-xs font-bold text-[#8c806f]">
              You have taken <strong className="text-white">{mulliganCount}</strong> mulligans
            </span>
          </div>
        </div>
      </div>

      {/* Center Cards Display (Screenshots media_1789543359349.png & media_1789543420993.png) */}
      <div className="my-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4 max-w-7xl mx-auto">
          {hand.map((card, idx) => {
            const isBottom = bottomCards.some(b => b.name === card.name);
            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Card Art Frame */}
                <div 
                  className={`w-full aspect-[5/7] rounded-xl overflow-hidden border-2 shadow-2xl transition-all relative ${
                    isBottom 
                      ? 'border-red-500 opacity-40 scale-95' 
                      : 'border-[#3e3221] hover:border-[#c5a059]'
                  }`}
                >
                  <img
                    src={generateOfflineCardArt(card.name, card.type || 'Card')}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  {isBottom && (
                    <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-300 px-2 py-1 rounded bg-black/80">
                        To Bottom
                      </span>
                    </div>
                  )}
                </div>

                {/* "Put on bottom" button (Screenshot media_1789543420993.png) */}
                {effectiveMulligans > 0 && (
                  <button
                    type="button"
                    onClick={() => togglePutOnBottom(card)}
                    className={`mt-2 w-full py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                      isBottom
                        ? 'bg-red-900/60 border-red-500 text-red-200'
                        : 'bg-[#1b150e] hover:bg-[#282015] border-[#3e3221] text-[#a09380] hover:text-white'
                    }`}
                  >
                    {isBottom ? 'Cancel' : 'Put on bottom'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Bottom Controls */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-4 border-t border-[#2d2417]">
        <div>
          {effectiveMulligans > 0 && (
            <div className="text-xs font-black text-[#f3d37a]">
              {bottomCards.length} / {effectiveMulligans} selected to put on bottom
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMulligan}
            className="px-6 py-2.5 rounded-xl bg-[#1c160e] hover:bg-[#282015] border border-[#3e3221] hover:border-[#c5a059] text-white text-xs font-bold transition-all"
          >
            Mulligan
          </button>

          {effectiveMulligans === 0 ? (
            <button
              type="button"
              onClick={handleKeepHand}
              className="px-8 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#c5a059]/20 transition-all"
            >
              Keep hand
            </button>
          ) : (
            <button
              type="button"
              disabled={bottomCards.length !== effectiveMulligans}
              onClick={handleKeepHand}
              className="px-8 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#c5a059]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Keep and put on bottom
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
