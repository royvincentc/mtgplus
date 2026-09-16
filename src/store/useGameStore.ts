import { create } from 'zustand';

export type CardZone = 'hand' | 'battlefield' | 'graveyard' | 'exile' | 'library' | 'command_zone' | 'stack';

export interface GameCard {
  instanceId: string;
  cardId: string; 
  name: string;
  zone: CardZone;
  x: number;
  y: number;
  tapped: boolean;
  faceDown: boolean;
  counters: number;
  ownerId: string;
  controllerId: string;
  imageUrl?: string; 
  isToken?: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  seatColor: 'red' | 'yellow' | 'blue' | 'white';
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
  
  addCardLocal: (card: GameCard) => void;
  updateCardPositionLocal: (instanceId: string, x: number, y: number, zone: CardZone) => void;
  toggleCardTapLocal: (instanceId: string) => void;
  
  addChatMessageLocal: (msg: ChatMessage) => void;
  clearState: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  cards: [],
  players: {},
  myPlayerId: '',
  chat: [],

  setRoomInfo: (roomId, myPlayerId) => set({ roomId, myPlayerId }),
  
  syncState: (cards, players, chat) => set((state) => ({ 
      cards, 
      players, 
      chat: chat || state.chat 
  })),

  syncStateFromRemote: (payload) => set(() => ({
    cards: payload.cards,
    players: payload.players,
  })),

  updatePlayerLifeLocal: (playerId, delta) => set((state) => {
    const p = state.players[playerId];
    if (!p) return state;
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

  addCardLocal: (card) => set((state) => {
      if (state.cards.find(c => c.instanceId === card.instanceId)) return state;
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

  addChatMessageLocal: (msg) => set((state) => ({
      chat: [...state.chat, msg]
  })),
  
  clearState: () => set({ roomId: null, cards: [], players: {}, chat: [] })
}));
