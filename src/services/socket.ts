import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useGameStore } from '../store/useGameStore';

let channel: RealtimeChannel | null = null;
let eventHandlers: Record<string, Function[]> = {};

// Fake Socket interface for easy migration
const fakeSocket = {
  id: 'local-' + Math.random().toString(36).substring(7),
  emit: (event: string, payload: any) => {
    if (!channel) return;
    
    // In our P2P model, we broadcast the action to others
    channel.send({
      type: 'broadcast',
      event: event,
      payload: payload
    });

    // Also simulate the server behavior: since the server used to apply it and broadcast state,
    // we need a host to do it, OR we just let everyone apply it. 
    // Wait, the local client already applied it via `updateCardPositionLocal`. 
    // But for some events like `joinRoom`, the local client needs a response.
    if (event === 'joinRoom') {
      const store = useGameStore.getState();
      store.addPlayerLocal({ id: fakeSocket.id, name: payload.username, seatColor: payload.seatColor, life: 40 });
      // Tell others we joined
      channel.send({ type: 'broadcast', event: 'playerJoined', payload: { id: fakeSocket.id, name: payload.username, seatColor: payload.seatColor, life: 40 }});
    }
  },
  on: (event: string, callback: Function) => {
    if (!eventHandlers[event]) eventHandlers[event] = [];
    eventHandlers[event].push(callback);
  },
  off: (event: string) => {
    delete eventHandlers[event];
  },
  disconnect: () => {
    if (channel) channel.unsubscribe();
  }
};

const triggerLocalEvent = (event: string, payload?: any) => {
  if (eventHandlers[event]) {
    eventHandlers[event].forEach(cb => cb(payload));
  }
};

export const initSocket = (serverUrl: string) => {
  // We ignore serverUrl since we use Supabase from env
  const roomId = useGameStore.getState().roomId || 'default-room';
  
  if (channel) {
    channel.unsubscribe();
  }

  channel = supabase.channel(`room:${roomId}`, {
    config: { broadcast: { self: false } }
  });

  // Map broadcast events back to local state updates
  channel.on('broadcast', { event: 'moveCard' }, ({ payload }) => {
    useGameStore.getState().updateCardPositionLocal(payload.instanceId, payload.x, payload.y, payload.zone);
  });
  
  channel.on('broadcast', { event: 'toggleCardTap' }, ({ payload }) => {
    useGameStore.getState().toggleCardTapLocal(payload);
  });

  channel.on('broadcast', { event: 'addCard' }, ({ payload }) => {
    useGameStore.getState().addCardLocal(payload);
  });

  channel.on('broadcast', { event: 'chatMessage' }, ({ payload }) => {
    useGameStore.getState().addChatMessageLocal(payload);
  });

  channel.on('broadcast', { event: 'updateLife' }, ({ payload }) => {
    useGameStore.getState().updateLifeLocal(payload.playerId, payload.delta);
  });

  channel.on('broadcast', { event: 'playerJoined' }, ({ payload }) => {
    useGameStore.getState().addPlayerLocal(payload);
    // When someone joins, broadcast our full state so they get in sync
    const state = useGameStore.getState();
    channel?.send({ type: 'broadcast', event: 'syncFullState', payload: { cards: state.cards, players: state.players } });
  });

  channel.on('broadcast', { event: 'syncFullState' }, ({ payload }) => {
    useGameStore.getState().syncStateFromRemote(payload);
  });

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Connected to Supabase Realtime');
      triggerLocalEvent('connect');
    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
      triggerLocalEvent('disconnect');
    }
  });

  return fakeSocket;
};

export const getSocket = () => {
  return channel ? fakeSocket : null;
};
