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
    <header className="h-20 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 shadow-2xl z-50 shrink-0 sticky top-0">
      {/* Logo Area */}
      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/dashboard')}>
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all group-hover:scale-105">
          M+
        </div>
        <span className="text-white font-black tracking-tight text-xl hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          MTG PLUS
        </span>
      </div>

      {/* Center Nav Items */}
      <nav className="hidden md:flex items-center gap-2 h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-white/10 text-orange-400 font-bold shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
            }
          >
            {item.icon}
            <span className="text-sm font-semibold tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Right User Profile */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button onClick={() => navigate('/profile')} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-white/5 px-2 py-1.5 pr-4 rounded-full transition-all group shadow-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-inner">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-slate-200 font-semibold group-hover:text-white transition-colors max-w-[120px] truncate text-sm">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
            </button>
            <button onClick={handleSignOut} className="p-2.5 rounded-xl bg-slate-800 border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all shadow-md">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 text-sm">
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
