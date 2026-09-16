import React, { useState } from 'react';
import { Search, ShieldAlert } from 'lucide-react';
import { generateOfflineCardArt } from '../services/cardCache';

interface CardItem {
  id: string;
  name: string;
  type_line: string;
  mana_cost?: string;
  oracle_text?: string;
  image_url?: string;
}

const DEFAULT_FEATURED_CARDS: CardItem[] = [
  { id: '1', name: 'The Ur-Dragon', type_line: 'Legendary Creature — Dragon Avatar', mana_cost: '{4}{W}{U}{B}{R}{G}', oracle_text: 'Eminence — As long as The Ur-Dragon is in the command zone or on the battlefield, other Dragon spells you cast cost {1} less to cast.\nFlying\nWhenever one or more Dragons you control attack, draw that many cards, then you may put a permanent card from your hand onto the battlefield.', image_url: 'https://cards.scryfall.io/normal/front/7/e/7e27fa5e-1a5a-44a4-a5eb-2b4639e72844.jpg' },
  { id: '2', name: 'Krenko, Mob Boss', type_line: 'Legendary Creature — Goblin Warrior', mana_cost: '{2}{R}{R}', oracle_text: '{T}: Create X 1/1 red Goblin creature tokens, where X is the number of Goblins you control.', image_url: 'https://cards.scryfall.io/normal/front/c/d/cd9fec9d-23c8-4d35-97c1-9499527198fb.jpg' },
  { id: '3', name: "Gishath, Sun's Avatar", type_line: 'Legendary Creature — Dinosaur Avatar', mana_cost: '{5}{R}{G}{W}', oracle_text: 'Vigilance, trample, haste\nWhenever Gishath deals combat damage to a player, reveal that many cards from the top of your library. Put any number of Dinosaur creature cards from among them onto the battlefield and the rest on the bottom in a random order.', image_url: 'https://cards.scryfall.io/normal/front/b/c/bc4a65de-23b5-48f0-b8b7-94608eaced3e.jpg' },
  { id: '4', name: 'Atraxa, Grand Unifier', type_line: 'Legendary Creature — Phyrexian Angel', mana_cost: '{3}{G}{W}{U}{B}', oracle_text: 'Flying, vigilance, deathtouch, lifelink\nWhen Atraxa enters the battlefield, reveal the top ten cards of your library. For each card type, you may put a card of that type into your hand. Put the rest on the bottom in a random order.', image_url: 'https://cards.scryfall.io/normal/front/8/f/8f6e4318-7964-44ed-a6b1-a6750033c4eb.jpg' },
  { id: '5', name: 'Sol Ring', type_line: 'Artifact', mana_cost: '{1}', oracle_text: '{T}: Add {C}{C}.', image_url: 'https://cards.scryfall.io/normal/front/e/0/e0f5be8e-a9ed-494b-9721-c4fc9ebbb3fb.jpg' },
  { id: '6', name: 'Cyclonic Rift', type_line: 'Instant', mana_cost: '{1}{U}', oracle_text: 'Return target nonland permanent you don\'t control to its owner\'s hand.\nOverload {6}{U}', image_url: 'https://cards.scryfall.io/normal/front/f/f/ff08e5ed-f47b-4d8e-8b8b-41675dccef8b.jpg' },
  { id: '7', name: 'Rhystic Study', type_line: 'Enchantment', mana_cost: '{2}{U}', oracle_text: 'Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.', image_url: 'https://cards.scryfall.io/normal/front/d/6/d6914dba-0d27-4055-ac34-b3ebf5802221.jpg' },
  { id: '8', name: 'Demonic Tutor', type_line: 'Sorcery', mana_cost: '{1}{B}', oracle_text: 'Search your library for a card, put that card into your hand, then shuffle.', image_url: 'https://cards.scryfall.io/normal/front/3/b/3bdf2504-5ba9-4588-8874-97d86b2e1f29.jpg' },
];

export const CardsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [cards, setCards] = useState<CardItem[]>(DEFAULT_FEATURED_CARDS);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setCards(DEFAULT_FEATURED_CARDS);
      return;
    }

    setSearching(true);
    try {
      // Scryfall query with Fortinet fallback
      const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query.trim())}`, {
        mode: 'cors'
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.data || []).slice(0, 24).map((c: any) => ({
          id: c.id,
          name: c.name,
          type_line: c.type_line,
          mana_cost: c.mana_cost,
          oracle_text: c.oracle_text,
          image_url: c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.normal
        }));
        setCards(items);
        setIsOfflineMode(false);
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      console.warn('Scryfall search blocked (Fortinet) or network error, filtering local cards:', err);
      setIsOfflineMode(true);
      const filtered = DEFAULT_FEATURED_CARDS.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.type_line.toLowerCase().includes(query.toLowerCase())
      );
      setCards(filtered);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#0a0805] text-[#f5f0e6] relative p-4 sm:p-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#c5a059]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#2d2417] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#c5a059] text-xs">―✦</span>
              <span className="text-[11px] font-bold text-[#a09380] uppercase tracking-[0.25em]">Card Database</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#f5f0e6] tracking-tight">
              Card Explorer
            </h1>
            <p className="text-xs sm:text-sm text-[#8c806f] mt-1">
              Search any Magic: The Gathering card, oracle rulings, and mana costs.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756755]" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search card name (e.g. Sol Ring)..."
                className="w-full bg-[#120f0b] border border-[#2d2417] focus:border-[#c5a059] rounded-xl py-2 pl-9 pr-3 text-xs text-[#f5f0e6] placeholder-[#5a5042] focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {searching ? '...' : 'Search'}
            </button>
          </form>
        </div>

        {isOfflineMode && (
          <div className="mb-6 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center gap-3 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Fortinet filter active. Using offline high-performance card cache.</span>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedCard(c)}
              className="group bg-[#120f0b] border border-[#2d2417] hover:border-[#c5a059]/60 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-md hover:shadow-2xl hover:scale-[1.02] flex flex-col"
            >
              <div className="aspect-[5/7] w-full bg-[#1c160e] relative overflow-hidden">
                <img
                  src={c.image_url || generateOfflineCardArt(c.name, c.type_line)}
                  alt={c.name}
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    // Fallback to offline SVG if CDN blocked by firewall
                    (e.currentTarget as HTMLImageElement).src = generateOfflineCardArt(c.name, c.type_line);
                  }}
                />
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-white group-hover:text-[#f3d37a] transition-colors truncate">
                  {c.name}
                </h4>
                <p className="text-[10px] text-[#8c806f] truncate mt-0.5">
                  {c.type_line}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div 
            className="bg-[#14100b] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl flex flex-col sm:flex-row gap-6 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full sm:w-64 shrink-0 aspect-[5/7] rounded-xl overflow-hidden shadow-2xl border border-[#3e3221]">
              <img
                src={selectedCard.image_url || generateOfflineCardArt(selectedCard.name, selectedCard.type_line)}
                alt={selectedCard.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = generateOfflineCardArt(selectedCard.name, selectedCard.type_line);
                }}
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-[#2d2417] pb-3 mb-3">
                  <div>
                    <h3 className="text-xl font-black text-white">{selectedCard.name}</h3>
                    <p className="text-xs text-[#a09380] mt-0.5">{selectedCard.type_line}</p>
                  </div>
                  {selectedCard.mana_cost && (
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#292014] text-[#e5c158] border border-[#c5a059]/40 shrink-0">
                      {selectedCard.mana_cost}
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#ded5c7] whitespace-pre-line leading-relaxed font-sans bg-[#0c0906] p-4 rounded-xl border border-[#2d2417]">
                  {selectedCard.oracle_text || 'No oracle rules text available for this printing.'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#2d2417]">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
