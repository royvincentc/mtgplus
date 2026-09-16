import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers, DoorOpen, Search, Users, Settings, LogOut } from 'lucide-react';

export const TopNavigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/decks', icon: <Layers className="w-5 h-5" />, label: 'Decks' },
    { to: '/rooms', icon: <DoorOpen className="w-5 h-5" />, label: 'Rooms' },
    { to: '/cards', icon: <Search className="w-5 h-5" />, label: 'Cards' },
    { to: '/community', icon: <Users className="w-5 h-5" />, label: 'Community' },
    { to: '/assistant', icon: <Settings className="w-5 h-5" />, label: 'Table Assistant' },
  ];

  return (
    <header className="h-20 w-full bg-[#110c08] border-b-2 border-[#b8860b] flex items-center justify-between px-6 shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-50 shrink-0">
      {/* Logo Area */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 border border-[#b8860b] rounded flex items-center justify-center text-[#b8860b] font-serif font-bold text-xl">
          MTG+
        </div>
        <span className="text-[#b8860b] font-bold tracking-widest text-sm uppercase hidden sm:block">Commander Zone</span>
      </div>

      {/* Center Nav Items */}
      <nav className="hidden md:flex items-center gap-8 h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex items-center gap-2 h-full border-b-2 px-2 transition-all duration-300 ${isActive ? 'border-[#b8860b] text-white font-bold text-shadow-glow' : 'border-transparent text-gray-400 hover:text-[#b8860b]'}`
            }
          >
            {item.icon}
            <span className="uppercase text-sm tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Right User Profile */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button onClick={() => navigate('/profile')} className="flex items-center gap-3 bg-[#1a130c] hover:bg-[#2b1f13] border border-[#b8860b]/30 px-4 py-2 rounded-full transition-colors group">
              <div className="w-8 h-8 rounded-full bg-[#b8860b] flex items-center justify-center text-black font-bold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-white font-bold group-hover:text-[#b8860b] transition-colors max-w-[120px] truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-full bg-[#1a130c] border border-gray-700 hover:border-red-500 hover:text-red-500 text-gray-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#b8860b] hover:bg-[#daa520] text-black font-bold uppercase tracking-widest rounded transition-colors text-sm">
            Login
          </button>
        )}
      </div>
    </header>
  );
};
