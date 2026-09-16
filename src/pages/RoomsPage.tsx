import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { 
  Users, 
  Lock, 
  Globe, 
  Search, 
  Plus, 
  Swords, 
  ArrowRight,
  Heart
} from 'lucide-react';

export interface RoomMetadata {
  id: string;
  name: string;
  hostName: string;
  hostId: string;
  format: string;
  seats: number;
  playersCount: number;
  lifeTotal: number;
  timer: 'none' | 'turn';
  mulligan: string;
  freeMulligan: boolean;
  isPrivate: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'commanderzone_public_rooms';

export const RoomsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinCodeInput, setShowJoinCodeInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');

  const [rooms, setRooms] = useState<RoomMetadata[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'the-tavern-401',
        name: 'The Tavern - Casual Commander',
        hostName: 'Planeswalker',
        hostId: 'system',
        format: 'Commander',
        seats: 4,
        playersCount: 1,
        lifeTotal: 40,
        timer: 'none',
        mulligan: 'London',
        freeMulligan: true,
        isPrivate: false,
        createdAt: Date.now() - 300000
      },
      {
        id: 'cedh-highpower-99',
        name: 'cEDH High Power Bracket 4',
        hostName: 'Spike',
        hostId: 'system2',
        format: 'cEDH',
        seats: 4,
        playersCount: 2,
        lifeTotal: 40,
        timer: 'turn',
        mulligan: 'London',
        freeMulligan: true,
        isPrivate: false,
        createdAt: Date.now() - 600000
      }
    ];
  });

  // Supabase Realtime channel for live room synchronization across all players
  useEffect(() => {
    const channel = supabase.channel('global-rooms-lobby');

    channel
      .on('broadcast', { event: 'room_published' }, ({ payload }) => {
        const newRoom = payload as RoomMetadata;
        setRooms(prev => {
          if (prev.some(r => r.id === newRoom.id)) return prev;
          const updated = [newRoom, ...prev];
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
      })
      .on('broadcast', { event: 'room_closed' }, ({ payload }) => {
        setRooms(prev => {
          const updated = prev.filter(r => r.id !== payload.id);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleJoinByCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!joinCode.trim()) return;
    navigate(`/play/${joinCode.trim()}`);
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                          r.format.toLowerCase().includes(search.toLowerCase()) ||
                          r.id.toLowerCase().includes(search.toLowerCase());
    const matchesFormat = formatFilter === 'All' || r.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="w-full h-full overflow-y-auto bg-[#0c0906] relative p-4 sm:p-8">
      {/* Background ambient gold glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#c5a059]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#9a7328]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Top Actions Row matching screenshots media_1789542016872.png & media_1789542018012.png */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-[#2d2417] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#c5a059] text-xs">―✦</span>
              <span className="text-[11px] font-bold text-[#a09380] uppercase tracking-[0.25em]">Multiplayer Lobbies</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#f5f0e6] tracking-tight flex items-center gap-3">
              Rooms
            </h1>
            <p className="text-xs sm:text-sm text-[#8c806f] mt-1">
              Find open tables or create your own custom game with friends.
            </p>
          </div>

          {/* Action Buttons: Join with Code & Create Room */}
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            {/* Enter room code popup input (Screenshot media_1789542018012.png) */}
            {showJoinCodeInput && (
              <form onSubmit={handleJoinByCode} className="w-full sm:w-64 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <input
                  type="text"
                  autoFocus
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter room code"
                  className="w-full bg-[#120f0b] border-2 border-[#d4af37] text-white placeholder-[#7a6f5e] px-3.5 py-2 rounded-xl text-sm focus:outline-none shadow-[0_0_15px_rgba(212,175,55,0.25)] font-semibold"
                />
              </form>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Join with code button (Screenshot media_1789542016872.png) */}
              <button
                onClick={() => {
                  if (showJoinCodeInput && joinCode.trim()) {
                    handleJoinByCode();
                  } else {
                    setShowJoinCodeInput(!showJoinCodeInput);
                  }
                }}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm tracking-wide transition-all shadow-md ${
                  showJoinCodeInput 
                    ? 'bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                    : 'bg-[#c5a059] hover:bg-[#d4af37] text-black shadow-[#c5a059]/20'
                }`}
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                Join with code
              </button>

              {/* Create room button (Screenshot media_1789542016872.png) */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-sm tracking-wide transition-all shadow-lg shadow-[#c5a059]/20 hover:shadow-[#d4af37]/40"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create room
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Format Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['All', 'Commander', 'cEDH', 'Standard', 'Modern'].map(fmt => (
              <button
                key={fmt}
                onClick={() => setFormatFilter(fmt)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  formatFilter === fmt
                    ? 'bg-[#292014] border border-[#c5a059]/60 text-[#f3d37a]'
                    : 'text-[#8c806f] hover:text-[#f5f0e6] hover:bg-[#18130d]'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756755]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rooms or hosts..."
              className="w-full bg-[#120f0b] border border-[#2d2417] focus:border-[#c5a059] rounded-xl py-2 pl-10 pr-4 text-xs text-[#f5f0e6] placeholder-[#5a5042] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Live Rooms List */}
        <div className="space-y-3">
          {filteredRooms.length === 0 ? (
            <div className="bg-[#120f0b] border border-[#2d2417] rounded-2xl p-12 text-center">
              <Swords className="w-10 h-10 text-[#5a5042] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#f5f0e6]">No open rooms found</h3>
              <p className="text-xs text-[#8c806f] mt-1 mb-5">Be the first to create a table and invite your friends!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider transition-all"
              >
                Create Room
              </button>
            </div>
          ) : (
            filteredRooms.map(room => (
              <div
                key={room.id}
                className="bg-[#14100b] hover:bg-[#1a150e] border border-[#2d2417] hover:border-[#c5a059]/40 rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md group"
              >
                <div className="flex items-center gap-4">
                  {/* Format Badge */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border font-bold shrink-0 ${
                    room.format === 'Commander' || room.format === 'cEDH'
                      ? 'bg-[#292014] border-[#c5a059]/40 text-[#f3d37a]'
                      : 'bg-[#181f28] border-blue-500/30 text-blue-400'
                  }`}>
                    <span className="text-[10px] uppercase tracking-wider text-[#a09380]">Format</span>
                    <span className="text-xs font-black truncate max-w-[50px]">{room.format}</span>
                  </div>

                  {/* Room Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#f5f0e6] group-hover:text-[#e5c158] transition-colors">
                        {room.name}
                      </h3>
                      {room.isPrivate ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/40">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          <Globe className="w-2.5 h-2.5" /> Public
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#8c806f]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                        <strong className="text-[#f5f0e6]">{room.playersCount}/{room.seats}</strong> Players
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        {room.lifeTotal} Life
                      </span>
                      <span>•</span>
                      <span>Mulligan: {room.mulligan}</span>
                      <span>•</span>
                      <span>Host: <span className="text-[#ded5c7]">{room.hostName}</span></span>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => navigate(`/play/${room.id}`)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#261f14] hover:bg-[#c5a059] text-[#f3d37a] hover:text-black border border-[#c5a059]/40 hover:border-[#c5a059] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
                >
                  Join Room
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Create Room Modal matching Screenshot media_1789542042818.png */}
      {showCreateModal && (
        <CreateRoomModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={(newRoom) => {
            setRooms(prev => [newRoom, ...prev]);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify([newRoom, ...rooms]));
            } catch {}
            // Broadcast to other online players
            supabase.channel('global-rooms-lobby').send({
              type: 'broadcast',
              event: 'room_published',
              payload: newRoom
            }).catch(() => {});
            setShowCreateModal(false);
            navigate(`/play/${newRoom.id}`);
          }}
        />
      )}

    </div>
  );
};

// Modal Component matching Screenshot media_1789542042818.png
interface CreateModalProps {
  onClose: () => void;
  onCreated: (room: RoomMetadata) => void;
}

const CreateRoomModal: React.FC<CreateModalProps> = ({ onClose, onCreated }) => {
  const { user } = useAuth();

  const [roomName, setRoomName] = useState('');
  const [lifeTotal, setLifeTotal] = useState(40);
  const [format, setFormat] = useState('Commander');
  const [timer, setTimer] = useState<'none' | 'turn'>('none');
  const [mulligan, setMulligan] = useState('London');
  const [freeMulligan, setFreeMulligan] = useState(true);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [seats, setSeats] = useState(4);

  const handleCreate = () => {
    const finalName = roomName.trim() || 'The Tavern';
    const slug = finalName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    const roomId = `${slug}-${Math.floor(100 + Math.random() * 900)}`;

    const hostName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Roy Codiñera';

    const newRoom: RoomMetadata = {
      id: roomId,
      name: finalName,
      hostName,
      hostId: user?.id || 'guest',
      format,
      seats,
      playersCount: 1,
      lifeTotal,
      timer,
      mulligan,
      freeMulligan,
      isPrivate: privacy === 'private',
      createdAt: Date.now()
    };

    onCreated(newRoom);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#120f0b] border border-[#c5a059]/40 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (Screenshot media_1789542042818.png) */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#f5f0e6]">Create room</h2>
          <div className="flex items-center gap-1.5 mt-1 text-[#c5a059]/70">
            <span className="text-xs">◇</span>
            <div className="h-[1px] w-16 bg-[#c5a059]/40" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[#f5f0e6]">
          
          {/* Left Column */}
          <div className="space-y-4">
            
            {/* ROOM NAME * */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f]">
                  ROOM NAME *
                </label>
                <span className="text-[10px] text-[#6e6354]">{roomName.length}/30</span>
              </div>
              <input
                type="text"
                maxLength={30}
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="E.g. The Tavern"
                className="w-full bg-[#0a0806] border border-[#3d3222] focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f0e6] placeholder-[#5a5042] focus:outline-none transition-colors"
              />
            </div>

            {/* FORMAT * */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f] mb-1.5">
                FORMAT *
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full bg-[#0a0806] border border-[#3d3222] focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f0e6] focus:outline-none transition-colors"
              >
                <option value="Commander">Commander</option>
                <option value="cEDH">cEDH</option>
                <option value="Modern">Modern</option>
                <option value="Standard">Standard</option>
                <option value="Pioneer">Pioneer</option>
                <option value="Pauper">Pauper</option>
                <option value="Freeform">Freeform</option>
              </select>
            </div>

            {/* MULLIGAN */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f] mb-1.5">
                MULLIGAN
              </label>
              <select
                value={mulligan}
                onChange={e => setMulligan(e.target.value)}
                className="w-full bg-[#0a0806] border border-[#3d3222] focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-xs text-[#f5f0e6] focus:outline-none transition-colors"
              >
                <option value="London">London</option>
                <option value="Vancouver">Vancouver</option>
                <option value="Paris">Paris</option>
              </select>
              <p className="text-[11px] text-cyan-400 mt-1.5 leading-tight font-medium">
                Draw 7 cards every time. When you keep, put one card on the bottom for each effective mulligan.
              </p>
            </div>

            {/* First mulligan is free */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#f5f0e6]">First mulligan is free</p>
                <p className="text-[11px] text-cyan-400 font-medium">Free</p>
              </div>
              <button
                type="button"
                onClick={() => setFreeMulligan(!freeMulligan)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  freeMulligan ? 'bg-[#c5a059]' : 'bg-[#292218]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${freeMulligan ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-4">
            
            {/* LIFE TOTAL */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f] mb-1.5">
                LIFE TOTAL
              </label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setLifeTotal(Math.max(1, lifeTotal - 1))}
                  className="w-10 h-9 bg-[#1c160e] hover:bg-[#282015] border border-[#3d3222] rounded-lg text-sm font-bold flex items-center justify-center text-[#ded5c7]"
                >
                  −
                </button>
                <div className="flex-1 bg-[#0a0806] border border-[#3d3222] rounded-lg py-1.5 text-center text-lg font-black text-[#f5f0e6]">
                  {lifeTotal}
                </div>
                <button
                  type="button"
                  onClick={() => setLifeTotal(lifeTotal + 1)}
                  className="w-10 h-9 bg-[#1c160e] hover:bg-[#282015] border border-[#3d3222] rounded-lg text-sm font-bold flex items-center justify-center text-[#ded5c7]"
                >
                  +
                </button>
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[20, 30, 40, 60].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLifeTotal(val)}
                    className={`py-1 rounded-lg text-xs font-bold border transition-colors ${
                      lifeTotal === val 
                        ? 'bg-[#2b2114] border-[#c5a059] text-[#f3d37a]' 
                        : 'bg-[#14100b] border-[#2e2417] text-[#8c806f] hover:text-[#ded5c7]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* TIMER */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f]">
                  TIMER
                </label>
                <span className="text-[11px] text-[#8c806f] font-semibold">{timer === 'none' ? 'No timer' : 'Per turn'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimer('none')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    timer === 'none'
                      ? 'bg-[#292014] border-[#c5a059] text-[#f3d37a]'
                      : 'bg-[#0a0806] border-[#3d3222] text-[#8c806f]'
                  }`}
                >
                  No timer
                </button>
                <button
                  type="button"
                  onClick={() => setTimer('turn')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    timer === 'turn'
                      ? 'bg-[#292014] border-[#c5a059] text-[#f3d37a]'
                      : 'bg-[#0a0806] border-[#3d3222] text-[#8c806f]'
                  }`}
                >
                  Per turn
                </button>
              </div>
            </div>

            {/* PRIVACY * */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f] mb-1.5">
                PRIVACY *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`py-2 px-2.5 rounded-xl text-left border transition-all flex flex-col ${
                    privacy === 'public'
                      ? 'bg-emerald-950/30 border-emerald-500/70 text-emerald-400'
                      : 'bg-[#0a0806] border-[#3d3222] text-[#8c806f]'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                  <span className="text-[10px] opacity-75 mt-0.5">Anyone can join</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`py-2 px-2.5 rounded-xl text-left border transition-all flex flex-col ${
                    privacy === 'private'
                      ? 'bg-amber-950/30 border-amber-500/70 text-amber-400'
                      : 'bg-[#0a0806] border-[#3d3222] text-[#8c806f]'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Private
                  </span>
                  <span className="text-[10px] opacity-75 mt-0.5">Invite only</span>
                </button>
              </div>
            </div>

            {/* SEATS */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c806f]">
                  SEATS
                </label>
                <span className="text-xs font-bold text-[#f5f0e6]">{seats}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSeats(num)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      seats === num 
                        ? 'bg-[#292014] border-[#c5a059] text-[#f3d37a]' 
                        : 'bg-[#0a0806] border-[#3d3222] text-[#8c806f] hover:text-[#ded5c7]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Buttons (Screenshot media_1789542042818.png) */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[#2d2417]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1c160e] hover:bg-[#261f14] text-[#8c806f] hover:text-[#ded5c7] text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#c5a059]/20"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
};
