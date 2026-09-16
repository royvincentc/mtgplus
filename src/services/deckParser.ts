// Text-only Deck Importer (MTGO / Arena / Moxfield paste format) without external API dependencies

export interface ParsedCard {
  name: string;
  count: number;
  type?: string;
  isCommander?: boolean;
}

export interface SavedDeck {
  id: string;
  name: string;
  commanderName: string;
  commanderArt?: string;
  format: string;
  bracket?: string; // e.g. "Bracket 3", "Bracket 4"
  cards: ParsedCard[];
  totalCards: number;
  updatedAt: string;
}

const STORAGE_KEY = 'commanderzone_user_decks';

// Pre-packaged default starter decks so user has decks immediately available
export const DEFAULT_DECKS: SavedDeck[] = [
  {
    id: 'deck-krenko',
    name: 'krenko b3',
    commanderName: 'Krenko, Mob Boss',
    commanderArt: 'https://cards.scryfall.io/art_crop/front/c/d/cd9fec9d-23c8-4d35-97c1-9499527198fb.jpg',
    format: 'Commander',
    bracket: 'Bracket 4',
    totalCards: 100,
    updatedAt: new Date().toISOString(),
    cards: [
      { name: 'Krenko, Mob Boss', count: 1, isCommander: true, type: 'Legendary Creature — Goblin Warrior' },
      { name: 'Goblin Chieftain', count: 1, type: 'Creature' },
      { name: 'Goblin King', count: 1, type: 'Creature' },
      { name: 'Goblin Warchief', count: 1, type: 'Creature' },
      { name: 'Siege-Gang Commander', count: 1, type: 'Creature' },
      { name: 'Sol Ring', count: 1, type: 'Artifact' },
      { name: 'Arcane Signet', count: 1, type: 'Artifact' },
      { name: 'Skullclamp', count: 1, type: 'Artifact' },
      { name: 'Chaos Warp', count: 1, type: 'Instant' },
      { name: 'Lightning Bolt', count: 1, type: 'Instant' },
      { name: 'Mountain', count: 35, type: 'Basic Land' },
    ]
  },
  {
    id: 'deck-gishath',
    name: 'gishath',
    commanderName: "Gishath, Sun's Avatar",
    commanderArt: 'https://cards.scryfall.io/art_crop/front/b/c/bc4a65de-23b5-48f0-b8b7-94608eaced3e.jpg',
    format: 'Commander',
    bracket: 'Bracket 3',
    totalCards: 100,
    updatedAt: new Date().toISOString(),
    cards: [
      { name: "Gishath, Sun's Avatar", count: 1, isCommander: true, type: 'Legendary Creature — Dinosaur Avatar' },
      { name: 'Zacama, Primal Calamity', count: 1, type: 'Creature' },
      { name: 'Etali, Primal Storm', count: 1, type: 'Creature' },
      { name: 'Carnage Tyrant', count: 1, type: 'Creature' },
      { name: 'Cultivate', count: 1, type: 'Sorcery' },
      { name: 'Kodama\'s Reach', count: 1, type: 'Sorcery' },
      { name: 'Sol Ring', count: 1, type: 'Artifact' },
      { name: 'Command Tower', count: 1, type: 'Land' },
      { name: 'Forest', count: 14, type: 'Basic Land' },
      { name: 'Plains', count: 10, type: 'Basic Land' },
      { name: 'Mountain', count: 11, type: 'Basic Land' },
    ]
  },
  {
    id: 'deck-ur-dragon',
    name: 'The Ur-Dragon Dragonstorm',
    commanderName: 'The Ur-Dragon',
    commanderArt: 'https://cards.scryfall.io/art_crop/front/7/e/7e27fa5e-1a5a-44a4-a5eb-2b4639e72844.jpg',
    format: 'Commander',
    bracket: 'Bracket 4',
    totalCards: 100,
    updatedAt: new Date().toISOString(),
    cards: [
      { name: 'The Ur-Dragon', count: 1, isCommander: true, type: 'Legendary Creature — Dragon Avatar' },
      { name: 'Scion of the Ur-Dragon', count: 1, type: 'Creature' },
      { name: 'Hellkite Tyrant', count: 1, type: 'Creature' },
      { name: 'Goldspan Dragon', count: 1, type: 'Creature' },
      { name: 'Sol Ring', count: 1, type: 'Artifact' },
      { name: 'Arcane Signet', count: 1, type: 'Artifact' },
      { name: 'Crux of Fate', count: 1, type: 'Sorcery' },
      { name: 'Command Tower', count: 1, type: 'Land' },
    ]
  }
];

export function getSavedDecks(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DECKS));
      return DEFAULT_DECKS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DECKS;
  }
}

export function saveDeck(deck: SavedDeck): void {
  const decks = getSavedDecks();
  const existingIdx = decks.findIndex(d => d.id === deck.id);
  if (existingIdx >= 0) {
    decks[existingIdx] = deck;
  } else {
    decks.unshift(deck);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function deleteDeck(deckId: string): void {
  const decks = getSavedDecks().filter(d => d.id !== deckId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

/**
 * Parse text paste format into a deck without external API requests
 */
export function parseDeckText(rawText: string, deckName = 'Imported Deck'): SavedDeck {
  const lines = rawText.split(/\r?\n/);
  const cards: ParsedCard[] = [];
  let isCommanderSection = false;
  let commanderName = '';

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('//')) continue;

    const lower = line.toLowerCase();
    if (lower === 'commander' || lower === 'commanders') {
      isCommanderSection = true;
      continue;
    }
    if (lower === 'deck' || lower === 'mainboard' || lower === 'sideboard') {
      isCommanderSection = false;
      continue;
    }

    // Match count and card name e.g. "1 Krenko, Mob Boss (M13) 138" or "1x Sol Ring"
    const match = line.match(/^(\d+)x?\s+([^(]+?)(?:\s+\([A-Z0-9]+\)|\s+\[[A-Z0-9]+\]|\s+\d+)?$/i);
    if (match) {
      const count = parseInt(match[1], 10);
      const name = match[2].trim();

      const isCmd = isCommanderSection || cards.length === 0;
      if (isCmd && !commanderName) {
        commanderName = name;
      }

      cards.push({
        name,
        count,
        isCommander: isCmd && commanderName === name
      });
    } else {
      // Just a card name without number
      if (line.length > 1) {
        const isCmd = isCommanderSection || cards.length === 0;
        if (isCmd && !commanderName) commanderName = line;
        cards.push({ name: line, count: 1, isCommander: isCmd });
      }
    }
  }

  const totalCards = cards.reduce((sum, c) => sum + c.count, 0);

  return {
    id: 'deck-' + Date.now(),
    name: deckName,
    commanderName: commanderName || 'Unknown Commander',
    format: 'Commander',
    bracket: 'Bracket 3',
    cards,
    totalCards,
    updatedAt: new Date().toISOString()
  };
}
