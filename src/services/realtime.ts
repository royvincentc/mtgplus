import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useGameStore } from '../store/useGameStore';

let channel: RealtimeChannel | null = null;

export const initRealtime = (roomId: string) => {
  if (channel) {
    channel.unsubscribe();
  }

  // Create a channel for this specific game room
  channel = supabase.channel(`room:${roomId}`, {
    config: {
      presence: { key: 'player' },
      broadcast: { self: false } // we apply our own events locally immediately
    }
  });

  // Handle incoming broadcast events
  channel.on('broadcast', { event: 'updateState' }, ({ payload }) => {
    const store = useGameStore.getState();
    store.syncStateFromRemote(payload.state);
  });
  
  channel.on('broadcast', { event: 'chatMessage' }, ({ payload }) => {
    const store = useGameStore.getState();
    store.addChatMessageLocal(payload.message);
  });

  channel.on('broadcast', { event: 'playerJoined' }, ({ payload }) => {
    const store = useGameStore.getState();
    store.addPlayerLocal(payload.player);
  });

  // Subscribe to the channel
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Joined Supabase Realtime channel:', roomId);
    }
  });

  return channel;
};

export const getChannel = () => channel;
