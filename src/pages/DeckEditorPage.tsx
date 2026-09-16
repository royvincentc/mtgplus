import React, { useState } from 'react';
import { Search, Save, Settings, Play, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Deck Data (Normally fetched from Supabase)
const mockDeck = {
  name: "The Ur-Dragon's Fury",
  commander: { name: "The Ur-Dragon", type: "Legendary Creature — Dragon Avatar", image: "https://cards.scryfall.io/large/front/7/e/7e27fa5e-1a5a-44a4-a5eb-2b4639e72844.jpg" },
  categories: [
    {
      name: "Creatures",
      count: 32,
      cards: [
        { name: "Scion of the Ur-Dragon", qty: 1, image: "https://cards.scryfall.io/large/front/5/6/565b2a40-57b1-451f-8c2a-e02222502288.jpg" },
        { name: "Hellkite Tyrant", qty: 1, image: "https://cards.scryfall.io/large/front/6/7/67d15ee6-916f-4ac9-a4d2-4a9bd389d451.jpg" },
        { name: "Goldspan Dragon", qty: 1, image: "https://cards.scryfall.io/large/front/9/d/9d914868-9000-4df2-a818-0ef8a7f636ae.jpg" },
        { name: "Old Gnawbone", qty: 1, image: "https://cards.scryfall.io/large/front/7/7/77ceba8b-4770-4bc6-8d69-d4f13fbdf984.jpg" },
      ]
    },
    {
      name: "Sorceries",
      count: 10,
      cards: [
        { name: "Crux of Fate", qty: 1, image: "https://cards.scryfall.io/large/front/1/1/11ea10f0-bd4f-4078-bfb6-68ecfe4e6b21.jpg" },
        { name: "Cultivate", qty: 1, image: "https://cards.scryfall.io/large/front/f/8/f8ba3642-88f5-47a4-bd76-cff113c19e5c.jpg" },
      ]
    },
    {
      name: "Artifacts",
      count: 14,
      cards: [
        { name: "Sol Ring", qty: 1, image: "https://cards.scryfall.io/large/front/e/0/e0f5be8e-a9ed-494b-9721-c4fc9ebbb3fb.jpg" },
        { name: "Arcane Signet", qty: 1, image: "https://cards.scryfall.io/large/front/6/7/679116e0-3fb1-4389-9a2f-e8b9fb6c28f6.jpg" },
      ]
    }
  ]
};

export const DeckEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(mockDeck.commander.image);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-hidden relative">
      {/* Background Aesthetics */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-10 blur-[80px]"
          style={{ backgroundImage: `url(${mockDeck.commander.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/50" />
      </div>

      {/* Header Toolbar */}
      <div className="h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/decks')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">{mockDeck.name}</h1>
            <p className="text-xs text-orange-400 font-bold uppercase tracking-wider">Commander / 100 Cards</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative mr-4 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search scryfall..." 
              className="w-64 bg-black/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">
            <Settings className="w-4 h-4" /> Options
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-green-900/20">
            <Play className="w-4 h-4" /> Playtest
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-orange-500/20">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden z-10 relative">
        
        {/* Left Column: Decklist */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            {/* Commander Section */}
            <div>
              <h2 className="text-white font-black text-lg mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                Commander
                <span className="text-slate-500 text-sm">1</span>
              </h2>
              <div 
                className="group relative h-12 bg-slate-900/80 border border-white/10 rounded-lg overflow-hidden flex items-center px-4 cursor-pointer hover:border-orange-500/50 transition-colors"
                onMouseEnter={() => setHoveredCard(mockDeck.commander.image)}
              >
                <div 
                  className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{ backgroundImage: `url(${mockDeck.commander.image})`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
                <span className="relative z-10 font-bold text-white text-shadow-sm">{mockDeck.commander.name}</span>
                <span className="relative z-10 ml-auto font-bold text-orange-400">1x</span>
              </div>
            </div>

            {/* Categories */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {mockDeck.categories.map(category => (
                <div key={category.name} className="break-inside-avoid">
                  <h2 className="text-white font-black text-sm uppercase tracking-widest mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                    {category.name}
                    <span className="text-slate-500">{category.count}</span>
                  </h2>
                  <div className="flex flex-col gap-1.5">
                    {category.cards.map(card => (
                      <div 
                        key={card.name}
                        className="group relative h-8 bg-slate-900/40 border border-transparent hover:border-white/20 rounded overflow-hidden flex items-center px-2 cursor-pointer transition-colors"
                        onMouseEnter={() => setHoveredCard(card.image)}
                      >
                        {/* Slice style background */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity"
                          style={{ backgroundImage: `url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <span className="relative z-10 text-slate-400 group-hover:text-white font-medium text-sm truncate">{card.name}</span>
                        <span className="relative z-10 ml-auto font-bold text-slate-500 group-hover:text-orange-400 text-xs">{card.qty}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column: Card Preview */}
        <div className="w-[400px] border-l border-white/10 bg-black/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center shrink-0 hidden xl:flex relative">
          
          <AnimatePresence mode="wait">
            <motion.img
              key={hoveredCard}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              src={hoveredCard || ''}
              alt="Card Preview"
              className="w-full max-w-[320px] rounded-[4.5%] shadow-[0_20px_50px_rgba(0,0,0,0.5)] drop-shadow-2xl"
            />
          </AnimatePresence>

          {/* Commander Highlight Tag */}
          {hoveredCard === mockDeck.commander.image && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-12 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full font-black text-white tracking-widest uppercase shadow-xl shadow-orange-500/20 border border-orange-400/50"
            >
              Commander
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};
