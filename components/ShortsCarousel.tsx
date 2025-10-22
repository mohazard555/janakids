import React from 'react';
import type { Video } from '../types';
import ShortCard from './ShortCard';

interface ShortsCarouselProps {
  shorts: Video[];
  onWatchNowClick: (videoId: number) => void;
}

const ShortsCarousel: React.FC<ShortsCarouselProps> = ({ shorts, onWatchNowClick }) => {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-r-8 border-purple-500 pr-4">
        فيديوهات قصيرة (شورتات)
      </h2>
      <div className="flex overflow-x-auto space-x-6 pb-4">
        {shorts.length > 0 ? (
          shorts.map(short => <ShortCard key={short.id} video={short} onWatchNowClick={onWatchNowClick} />)
        ) : (
          <div className="w-full text-center py-8 bg-gray-100 rounded-2xl">
            <p className="text-lg text-gray-500">
                لم تتم إضافة أي فيديوهات قصيرة بعد.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortsCarousel;