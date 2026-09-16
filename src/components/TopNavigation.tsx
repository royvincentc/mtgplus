import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Layers, 
  DoorOpen, 
  Search, 
  Users, 
  Settings, 
  Maximize2, 
  Minimize2, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

export const TopNavigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setFriendsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Roy Codiñera';
  const initial = displayName.charAt(0).toUpperCase() || 'R';

  // Navigation Items without Table Assistant
  const navItems = [
    { to: '/decks', label: 'Decks', icon: <Layers className="w-5 h-5 text-[#c5a059]" /> },
    { to: '/rooms', label: 'Rooms', icon: <DoorOpen className="w-5 h-5 text-[#c5a059]" /> },
    { to: '/cards', label: 'Cards', icon: <Search className="w-5 h-5 text-[#c5a059]" /> },
    { to: '/community', label: 'Community', icon: <Users className="w-5 h-5 text-[#c5a059]" /> },
  ];

  return (
    <header className="h-16 w-full bg-[#120f0a] border-b border-[#2d2417] flex items-center justify-between px-3 sm:px-6 shadow-[0_4px_20px_rgba(0,0,0,0.6)] z-50 shrink-0 sticky top-0">
      
      {/* Left: Brand Logo */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer group shrink-0" 
        onClick={() => navigate('/dashboard')}
      >
        <div className="w-9 h-9 rounded-lg border border-[#c5a059]/60 bg-gradient-to-br from-[#261e13] to-[#120f0a] flex items-center justify-center shadow-[0_0_12px_rgba(197,160,89,0.25)] group-hover:border-[#e5c158] transition-all">
          <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
            <rect x="6" y="12" width="18" height="24" rx="2.5" transform="rotate(-15 6 12)" stroke="#c5a059" strokeWidth="1.5" fill="#1b150d" />
            <rect x="14" y="8" width="18" height="26" rx="2.5" stroke="#e5c158" strokeWidth="1.8" fill="#241c12" />
            <path d="M23 16 C23 20 21 21 17 21 C21 22 23 23 23 27 C23 23 25 22 29 21 C25 21 23 20 23 16 Z" fill="#fff5cc" />
          </svg>
        </div>
        <div className="hidden lg:flex flex-col">
          <span className="text-[#e5c158] font-serif font-black tracking-[0.18em] text-xs uppercase drop-shadow-sm">
            Commander Zone
          </span>
        </div>
      </div>

      {/* Center: Navigation Tabs (Always accessible on Mobile & Desktop) */}
      <nav className="flex items-center gap-1 sm:gap-2 h-full overflow-x-auto no-scrollbar px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-[#292014] border border-[#c5a059]/60 text-[#f3d37a] shadow-[0_0_10px_rgba(197,160,89,0.15)]' 
                  : 'text-[#9c8e7c] hover:text-[#f5f0e6] hover:bg-[#1c160e]'
              }`
            }
          >
            {item.icon}
            <span className="tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Right: User Profile, Friends Button, Hamburger Menu (matching Screenshot media_1789542147341.png) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative" ref={menuRef}>
        
        {user ? (
          <>
            {/* User Pill */}
            <button 
              onClick={() => navigate('/profile')} 
              className="flex items-center gap-2 bg-[#1b150e] hover:bg-[#261e14] border border-[#3e3221] hover:border-[#c5a059]/50 py-1 pl-1 pr-3 rounded-full transition-all group shadow-sm max-w-[130px] sm:max-w-[170px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-[#e5c158] to-[#9a7328] border border-[#fff2b3]/40 flex items-center justify-center text-black font-black text-xs sm:text-sm shadow-sm shrink-0">
                {initial}
              </div>
              <span className="text-[#f5f0e6] font-bold text-xs sm:text-sm truncate group-hover:text-[#e5c158] transition-colors">
                {displayName}
              </span>
            </button>

            {/* Friends Icon Button with Green Badge (Screenshot media_1789542147341.png) */}
            <div className="relative">
              <button
                onClick={() => setFriendsOpen(!friendsOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1b150e] border border-[#3e3221] hover:border-[#c5a059]/50 flex items-center justify-center text-[#22c55e] hover:bg-[#261e14] transition-all relative"
                title="Friends"
              >
                <Users className="w-4 h-4 text-[#22c55e]" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#120f0a] border border-[#22c55e] text-[#22c55e] text-[9px] font-black flex items-center justify-center shadow-sm">
                  0
                </span>
              </button>

              {/* Friends Drawer */}
              {friendsOpen && (
                <div className="absolute right-0 top-12 w-64 bg-[#14100b] border border-[#3e3221] rounded-2xl p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-[#2d2417] pb-2 mb-3">
                    <span className="text-xs font-bold text-[#e5c158] uppercase tracking-wider">Friends (0 Online)</span>
                  </div>
                  <p className="text-xs text-[#8c806f] py-4 text-center">No friends online right now.</p>
                </div>
              )}
            </div>

            {/* Hamburger Button with Slanted Slashes (Screenshot media_1789542147341.png) */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1b150e] border border-[#3e3221] hover:border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] hover:bg-[#261e14] transition-all"
                title="Menu"
              >
                <div className="flex flex-col gap-[3px] items-center justify-center w-4">
                  <div className="w-3.5 h-[2px] bg-[#c5a059] rounded rotate-[-25deg] translate-y-[-1px]" />
                  <div className="w-3.5 h-[2px] bg-[#c5a059] rounded rotate-[-25deg]" />
                  <div className="w-3.5 h-[2px] bg-[#c5a059] rounded rotate-[-25deg] translate-y-[1px]" />
                </div>
              </button>

              {/* Dropdown Menu (Screenshot media_1789542147341.png) */}
              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-[#16120c] border border-[#3e3221] rounded-2xl p-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-50 text-[#f5f0e6] backdrop-blur-md">
                  
                  {/* Settings */}
                  <button 
                    onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#261e14] text-xs font-semibold text-[#ded5c7] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#a09380]" />
                    Settings
                  </button>

                  {/* Fullscreen */}
                  <button 
                    onClick={() => { handleToggleFullscreen(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#261e14] text-xs font-semibold text-[#ded5c7] transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#a09380]" /> : <Maximize2 className="w-4 h-4 text-[#a09380]" />}
                    Fullscreen
                  </button>

                  {/* Language */}
                  <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#261e14] text-xs font-semibold text-[#ded5c7] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-base">🇬🇧</span>
                      Language
                    </div>
                    <span className="text-[#8c806f] text-[11px]">English ›</span>
                  </div>

                  {/* FAQ */}
                  <button 
                    onClick={() => { alert('Commander Zone FAQ & Rules guide.'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#261e14] text-xs font-semibold text-[#ded5c7] transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[#a09380]" />
                    FAQ
                  </button>

                  <div className="h-[1px] bg-[#2d2417] my-1" />

                  {/* Log off (Red) */}
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-950/40 text-xs font-bold text-[#ef4444] transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-[#ef4444]" />
                    Log off
                  </button>

                </div>
              )}
            </div>
          </>
        ) : (
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-gradient-to-r from-[#8a6b32] via-[#bfa054] to-[#8a6b32] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Sign In
          </button>
        )}

      </div>
    </header>
  );
};
