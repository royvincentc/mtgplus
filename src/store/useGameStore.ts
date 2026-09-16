import { create } from 'zustand';

export type CardZone = 'hand' | 'battlefield' | 'graveyard' | 'exile' | 'library' | 'command_zone' | 'stack';

export interface GameCard {
  instanceId: string;
  cardId?: string; 
  name: string;
  zone: CardZone;
  x: number;
  y: number;
  tapped: boolean;
  faceDown?: boolean;
  counters?: number;
  ownerId: string;
  controllerId?: string;
  imageUrl?: string; 
  isToken?: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  seatColor: 'red' | 'yellow' | 'blue' | 'white' | 'green' | 'purple';
  life: number;
  commanderDamage: Record<string, number>;
  poison: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem: boolean;
}

export interface GameState {
  roomId: string | null;
  cards: GameCard[];
  players: Record<string, PlayerState>;
  myPlayerId: string;
  chat: ChatMessage[];
  
  // Actions
  setRoomInfo: (roomId: string, myPlayerId: string) => void;
  syncState: (cards: GameCard[], players: Record<string, PlayerState>, chat?: ChatMessage[]) => void;
  
  updatePlayerLifeLocal: (playerId: string, delta: number) => void;
  addPlayerLocal: (player: PlayerState) => void;
  syncStateFromRemote: (payload: { cards: GameCard[], players: Record<string, PlayerState> }) => void;
  
  addCard: (card: GameCard) => void;
  addCardLocal: (card: GameCard) => void;
  updateCardPositionLocal: (instanceId: string, x: number, y: number, zone: CardZone) => void;
  toggleCardTapLocal: (instanceId: string) => void;
  drawCardLocal: (playerId: string) => void;
  untapAllLocal: (playerId: string) => void;
  
  addChatMessageLocal: (msg: ChatMessage) => void;
  clearState: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  cards: [],
  players: {
    'local-user': {
      id: 'local-user',
      name: 'Player 1',
      seatColor: 'red',
      life: 40,
      commanderDamage: {},
      poison: 0
    },
    'opponent-user': {
      id: 'opponent-user',
      name: 'Opponent',
      seatColor: 'yellow',
      life: 40,
      commanderDamage: {},
      poison: 0
    }
  },
  myPlayerId: 'local-user',
  chat: [],

  setRoomInfo: (roomId, myPlayerId) => set((state) => ({ 
    roomId, 
    myPlayerId,
    players: {
      ...state.players,
      [myPlayerId]: {
        id: myPlayerId,
        name: state.players[myPlayerId]?.name || 'Player',
        seatColor: 'red',
        life: 40,
        commanderDamage: {},
        poison: 0
      }
    }
  })),
  
  syncState: (cards, players, chat) => set((state) => ({ 
      cards, 
      players: Object.keys(players).length > 0 ? players : state.players, 
      chat: chat || state.chat 
  })),

  syncStateFromRemote: (payload) => set((state) => ({
    cards: payload.cards || state.cards,
    players: payload.players && Object.keys(payload.players).length > 0 ? payload.players : state.players,
  })),

  updatePlayerLifeLocal: (playerId, delta) => set((state) => {
    const p = state.players[playerId];
    if (!p) {
      // If player doesn't exist yet, create one
      return {
        players: {
          ...state.players,
          [playerId]: {
            id: playerId,
            name: 'Player',
            seatColor: 'red',
            life: 40 + delta,
            commanderDamage: {},
            poison: 0
          }
        }
      };
    }
    return {
      players: {
        ...state.players,
        [playerId]: { ...p, life: p.life + delta }
      }
    };
  }),

  addPlayerLocal: (player) => set((state) => ({
    players: { ...state.players, [player.id]: player }
  })),

  addCard: (card) => set((state) => {
    if (state.cards.some(c => c.instanceId === card.instanceId)) return state;
    return { cards: [...state.cards, card] };
  }),

  addCardLocal: (card) => set((state) => {
    if (state.cards.some(c => c.instanceId === card.instanceId)) return state;
    return { cards: [...state.cards, card] };
  }),

  updateCardPositionLocal: (instanceId, x, y, zone) => set((state) => ({
    cards: state.cards.map(c => 
      c.instanceId === instanceId ? { ...c, x, y, zone } : c
    )
  })),

  toggleCardTapLocal: (instanceId) => set((state) => ({
    cards: state.cards.map(c => 
      c.instanceId === instanceId ? { ...c, tapped: !c.tapped } : c
    )
  })),

  drawCardLocal: (playerId) => set((state) => {
    // Find top card in library
    const libraryCards = state.cards.filter(c => c.zone === 'library' && c.ownerId === playerId);
    if (libraryCards.length === 0) return state;

    const topCard = libraryCards[libraryCards.length - 1];
    return {
      cards: state.cards.map(c => 
        c.instanceId === topCard.instanceId 
          ? { ...c, zone: 'hand', x: 450 + Math.random() * 80, y: 1100 }
          : c
      )
    };
  }),

  untapAllLocal: (playerId) => set((state) => ({
    cards: state.cards.map(c => 
      c.ownerId === playerId ? { ...c, tapped: false } : c
    )
  })),

  addChatMessageLocal: (msg) => set((state) => ({
      chat: [...state.chat, msg]
  })),
  
  clearState: () => set({ roomId: null, cards: [], players: {}, chat: [] })
}));
