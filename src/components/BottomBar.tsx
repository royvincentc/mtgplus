import React from 'react';
import { Plus, Users, Library, Import, Search } from 'lucide-react';

interface BottomBarProps {
  onImportClick: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onImportClick }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-700 flex items-center justify-around px-2 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] safe-area-bottom" onPointerDown={e => e.stopPropagation()}>
      <button className="flex flex-col items-center justify-center text-gray-400 hover:text-white w-16 h-full active:scale-95 transition-transform">
        <Library size={24} />
        <span className="text-[10px] mt-1 font-medium">Library</span>
      </button>
      
      <button className="flex flex-col items-center justify-center text-gray-400 hover:text-white w-16 h-full active:scale-95 transition-transform">
        <Search size={24} />
        <span className="text-[10px] mt-1 font-medium">Search</span>
      </button>
      
      <div className="relative -top-4">
        <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full w-14 h-14 shadow-lg active:scale-95 transition-transform border-4 border-gray-900">
          <Plus size={32} />
        </button>
      </div>
      
      <button 
        className="flex flex-col items-center justify-center text-gray-400 hover:text-white w-16 h-full active:scale-95 transition-transform"
        onClick={onImportClick}
      >
        <Import size={24} />
        <span className="text-[10px] mt-1 font-medium">Import</span>
      </button>
      
      <button className="flex flex-col items-center justify-center text-gray-400 hover:text-white w-16 h-full active:scale-95 transition-transform">
        <Users size={24} />
        <span className="text-[10px] mt-1 font-medium">Players</span>
      </button>
    </div>
  );
};
