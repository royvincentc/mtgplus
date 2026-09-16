import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, Search, Plus, Shield, Swords } from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  
  // Mock active rooms for now (since we don't have a DB table yet)
  const activeRooms = [
    { id: 'EDH-casual-1', name: 'Casual EDH | No infinite combos', players: 3, maxPlayers: 4, isPrivate: false, format: 'Commander' },
    { id: 'CEDH-pro', name: 'cEDH High Power', players: 2, maxPlayers: 4, isPrivate: true, format: 'cEDH' },
    { id: 'Modern-test', name: 'Modern Testing', players: 1, maxPlayers: 2, isPrivate: false, format: 'Modern' },
  ];

  const handleJoin = (roomId: string) => {
    // We would normally prompt for a password here if isPrivate is true
    navigate(`/play/${roomId}`);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Swords className="text-orange-500 w-8 h-8" />
              Game Rooms
            </h1>
            <p className="text-slate-400 mt-1">Join an open table or host your own.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search rooms..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-orange-500/20 shrink-0"
            >
              <Plus className="w-5 h-5" />
              New Game
            </button>
          </div>
        </div>

        {/* Filters / Tabs (Untap style) */}
        <div className="flex gap-6 border-b border-white/10 mb-6">
          <button className="px-4 py-3 border-b-2 border-orange-500 text-white font-bold">Play</button>
          <button className="px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-300">Watch</button>
          <button className="px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-300">Replays</button>
        </div>

        {/* Room List */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col gap-[1px] bg-white/5">
          {activeRooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(room => (
            <div key={room.id} className="bg-slate-900 p-4 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
              <div className="flex items-center gap-6">
                <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider w-24 text-center ${room.format === 'Commander' || room.format === 'cEDH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                  {room.format}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    {room.name}
                    {room.isPrivate && <Lock className="w-4 h-4 text-slate-500" />}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.players}/{room.maxPlayers} Players</span>
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Hosted by Community</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleJoin(room.id)}
                disabled={room.players >= room.maxPlayers}
                className="px-6 py-2 border border-white/10 hover:border-orange-500 hover:text-orange-400 text-slate-300 font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {room.players >= room.maxPlayers ? 'Full' : 'Join Game'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && <CreateRoomModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};

const CreateRoomModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [password, setPassword] = useState('');

  const handleCreate = () => {
    if (!roomName.trim()) return;
    
    const roomId = roomName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
    // Setting maxPlayers in state/store will be needed for dynamic GameBoard
    // For now we just route to it.
    
    navigate(`/play/${roomId}?max=${maxPlayers}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600" />
        
        <h2 className="text-2xl font-black text-white mb-6">Host New Game</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Room Name</label>
            <input 
              type="text" 
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="e.g. Chill Commander B3"
              className="w-full bg-slate-950 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max Players</label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setMaxPlayers(num)}
                  className={`py-2 rounded-lg font-bold border transition-colors ${maxPlayers === num ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/30'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Password (Optional)
            </label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank for public room"
              className="w-full bg-slate-950 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border border-white/10 text-slate-400 rounded-lg font-bold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!roomName.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold hover:from-orange-400 hover:to-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};
