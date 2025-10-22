import React from 'react';
import type { Video } from '../types';

interface ShortCardProps {
  video: Video;
  onWatchNowClick: (videoId: number) => void;
}

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-0 group-hover:opacity-80 transition-opacity duration-300" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const ShortCard: React.FC<ShortCardProps> = ({ video, onWatchNowClick }) => {
  return (
    <a 
      href={video.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onWatchNowClick(video.id)}
      className="group relative flex-shrink-0 w-48 h-80 rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
    >
      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <PlayIcon />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-white font-bold text-md truncate">{video.title}</h3>
      </div>
    </a>
  );
};

export default ShortCard;