import React, { useState } from 'react';
import { getSocket } from '../services/socket';
import { useGameStore } from '../store/useGameStore';

export const Lobby: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [seatColor, setSeatColor] = useState<'red'|'yellow'|'blue'|'white'>('red');
  const setRoomInfo = useGameStore(state => state.setRoomInfo);

  const handleJoin = () => {
    if (!roomId.trim() || !username.trim()) return;
    
    const socket = getSocket();
    if (socket) {
      socket.emit('joinRoom', { roomId, username, seatColor });
      setRoomInfo(roomId, socket.id as string);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#1a110a] flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
      {/* Decorative background cards/elements could go here */}
      
      <div className="bg-gray-900/95 backdrop-blur-md p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-gray-700 w-full max-w-lg relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-100 to-gray-500 text-center mb-2 tracking-widest drop-shadow-sm">
            MTG+ TABLETOP
          </h1>
          <p className="text-center text-gray-400 text-sm mb-8">Join a room to start playing</p>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider ml-1">Room ID</label>
              <input 
                type="text" 
                className="w-full bg-black/50 text-white px-5 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 font-mono text-lg"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                placeholder="fnm-room-1"
                autoComplete="off"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider ml-1">Username</label>
              <input 
                type="text" 
                className="w-full bg-black/50 text-white px-5 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-lg"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Jace Beleren"
                autoComplete="off"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider ml-1">Select Seat</label>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4 justify-between">
                {(['red', 'yellow', 'blue', 'white'] as const).map(color => {
                   const bgColors = {
                     red: 'from-red-600 to-red-900 border-red-500',
                     yellow: 'from-yellow-500 to-yellow-700 border-yellow-400',
                     blue: 'from-blue-500 to-blue-800 border-blue-400',
                     white: 'from-gray-100 to-gray-400 border-white',
                   };
                   
                   return (
                    <button
                      key={color}
                      onClick={() => setSeatColor(color)}
                      className={`
                        relative flex-1 h-16 rounded-xl border-2 transition-all duration-200 overflow-hidden group
                        ${seatColor === color ? `scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10 ${bgColors[color]}` : 'border-gray-800 opacity-60 hover:opacity-100 bg-gray-800'}
                      `}
                    >
                      {/* Inner gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[color]} ${seatColor === color ? 'opacity-100' : 'opacity-20 group-hover:opacity-40'}`} />
                      <span className={`relative z-10 font-bold uppercase tracking-wider text-xs drop-shadow-md ${color === 'white' && seatColor === color ? 'text-black' : 'text-white'}`}>
                        {color}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button 
              onClick={handleJoin}
              disabled={!roomId.trim() || !username.trim()}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl uppercase tracking-widest text-lg shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              Enter Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
