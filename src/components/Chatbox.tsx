import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getSocket } from '../services/socket';
import { MessageSquare, X } from 'lucide-react';

export const Chatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const chat = useGameStore(state => state.chat);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('sendChat', text);
    }
    setText('');
  };

  if (!isOpen) {
    return (
      <button 
        onPointerDown={e => e.stopPropagation()}
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 z-40 bg-gray-900/80 p-3 rounded-full border border-gray-700 text-white shadow-lg hover:bg-gray-800 transition-colors"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="absolute top-0 left-0 bottom-16 md:bottom-0 w-80 bg-gray-900/95 z-40 flex flex-col border-r border-gray-700 shadow-2xl transition-transform" onPointerDown={e => e.stopPropagation()}>
      <div className="p-4 bg-gray-800 flex items-center justify-between border-b border-gray-700">
        <h3 className="text-white font-bold tracking-wider">ROOM CHAT</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
        {chat.map(msg => (
          <div key={msg.id} className={`text-sm ${msg.isSystem ? 'text-gray-400 italic text-center text-xs' : 'text-white'}`}>
            {!msg.isSystem && <span className="font-bold text-blue-400 mr-2">{msg.sender}:</span>}
            {msg.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSend} className="p-3 bg-gray-800 border-t border-gray-700 flex">
        <input 
          type="text" 
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-l border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded-r font-bold text-white hover:bg-blue-500">
          Send
        </button>
      </form>
    </div>
  );
};
