import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Layers, 
  Play, 
  Edit3, 
  Trash2, 
  Import, 
  Search
} from 'lucide-react';
import { getSavedDecks, saveDeck, deleteDeck, parseDeckText } from '../services/deckParser';
import type { SavedDeck } from '../services/deckParser';

export const DecksPage: React.FC = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [search, setSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importName, setImportName] = useState('');

  useEffect(() => {
    setDecks(getSavedDecks());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this deck?')) {
      deleteDeck(id);
      setDecks(getSavedDecks());
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const parsed = parseDeckText(importText, importName.trim() || 'New Deck');
    saveDeck(parsed);
    setDecks(getSavedDecks());
    setShowImportModal(false);
    setImportText('');
    setImportName('');
  };

  const filteredDecks = decks.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.commanderName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-[#0a0805] text-[#f5f0e6] relative p-4 sm:p-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#c5a059]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#9a7328]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#2d2417] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#c5a059] text-xs">―✦</span>
              <span className="text-[11px] font-bold text-[#a09380] uppercase tracking-[0.25em]">Deck Collection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#f5f0e6] tracking-tight">
              Decks
            </h1>
            <p className="text-xs sm:text-sm text-[#8c806f] mt-1">
              Build, import, and manage your 100-card Commander decks.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b150e] hover:bg-[#282015] border border-[#3e3221] hover:border-[#c5a059]/40 text-[#ded5c7] text-xs font-bold transition-all shadow-sm"
            >
              <Import className="w-4 h-4 text-[#c5a059]" />
              Import Text
            </button>

            <button
              onClick={() => navigate('/decks/new')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#c5a059]/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Deck
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80 mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756755]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search decks by name or commander..."
            className="w-full bg-[#120f0b] border border-[#2d2417] focus:border-[#c5a059] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#f5f0e6] placeholder-[#5a5042] focus:outline-none transition-colors"
          />
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map(deck => (
            <div
              key={deck.id}
              onClick={() => navigate(`/decks/${deck.id}`)}
              className="group bg-[#120f0b] hover:bg-[#18130d] border border-[#2d2417] hover:border-[#c5a059]/50 rounded-3xl overflow-hidden cursor-pointer transition-all shadow-xl hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex flex-col relative"
            >
              {/* Art Banner */}
              <div className="h-44 relative overflow-hidden bg-[#1a140d]">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-100"
                  style={{ backgroundImage: `url(${deck.commanderArt || 'https://cards.scryfall.io/art_crop/front/7/e/7e27fa5e-1a5a-44a4-a5eb-2b4639e72844.jpg'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120f0b] via-transparent to-black/40" />

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-[#c5a059]/40 text-[10px] font-black text-[#f3d37a]">
                    {deck.format}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#292014]/90 border border-[#c5a059]/40 text-[10px] font-bold text-[#e5c158]">
                    {deck.bracket || 'Bracket 3'}
                  </span>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-[#f3d37a] transition-colors truncate">
                    {deck.name}
                  </h3>
                  <p className="text-xs text-[#a09380] font-medium mt-0.5 truncate">
                    {deck.commanderName}
                  </p>
                </div>

                {/* Footer stats & actions */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#251d13]">
                  <span className="text-xs font-bold text-[#756755] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
                    {deck.totalCards} Cards
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/play/solo-test-${Math.floor(100 + Math.random() * 900)}`);
                      }}
                      className="p-2 rounded-lg hover:bg-[#282015] text-[#c5a059] transition-colors"
                      title="Playtest Table"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/decks/${deck.id}`);
                      }}
                      className="p-2 rounded-lg hover:bg-[#282015] text-[#ded5c7] transition-colors"
                      title="Edit Deck"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(deck.id, e)}
                      className="p-2 rounded-lg hover:bg-red-950/40 text-[#756755] hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Paste-Text Importer Modal (Fortinet Safe: No external network calls) */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#120f0b] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white mb-1">Import Deck from Text</h3>
            <p className="text-xs text-[#8c806f] mb-4">
              Paste your decklist from Moxfield, Archidekt, or Arena. No external API connection is made.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f] mb-1.5">
                  Deck Name
                </label>
                <input
                  type="text"
                  required
                  value={importName}
                  onChange={e => setImportName(e.target.value)}
                  placeholder="e.g. Ur-Dragon Combo"
                  className="w-full bg-[#0a0806] border border-[#3d3222] focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f0e6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f] mb-1.5">
                  Decklist (Paste format)
                </label>
                <textarea
                  required
                  rows={8}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder={"Commander\n1 The Ur-Dragon\n\nDeck\n1 Sol Ring\n1 Arcane Signet\n1 Command Tower\n36 Mountain"}
                  className="w-full bg-[#0a0806] border border-[#3d3222] focus:border-[#c5a059] rounded-xl p-3 text-xs text-[#f5f0e6] placeholder-[#5a5042] font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1c160e] text-[#8c806f] hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider transition-all"
                >
                  Save Deck
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
