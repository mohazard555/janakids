
import React from 'react';
import type { Playlist } from '../types';

interface PlaylistTabsProps {
  playlists: Playlist[];
  selectedId: number | 'all';
  onSelect: (id: number | 'all') => void;
}

const PlaylistTabs: React.FC<PlaylistTabsProps> = ({ playlists, selectedId, onSelect }) => {
  const baseStyle = "px-6 py-3 font-bold rounded-t-lg cursor-pointer transition-colors duration-300 whitespace-nowrap";
  const activeStyle = "bg-white text-sky-600 shadow-inner";
  const inactiveStyle = "bg-sky-200/50 hover:bg-sky-200/80 text-sky-800";
    
  if (playlists.length === 0) {
    return null; // Don't render tabs if there are no playlists
  }

  return (
    <div className="mb-8 border-b-4 border-sky-300">
      <nav className="flex space-x-2 -mb-1 overflow-x-auto">
        <button
          onClick={() => onSelect('all')}
          className={`${baseStyle} ${selectedId === 'all' ? activeStyle : inactiveStyle}`}
        >
          كل الفيديوهات
        </button>
        {playlists.map(playlist => (
          <button
            key={playlist.id}
            onClick={() => onSelect(playlist.id)}
            className={`${baseStyle} ${selectedId === playlist.id ? activeStyle : inactiveStyle}`}
          >
            {playlist.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PlaylistTabs;
