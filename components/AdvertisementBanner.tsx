import React from 'react';
import type { AdSettings } from '../types';

interface AdvertisementBannerProps {
  ad: AdSettings;
  onClose: () => void;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({ ad, onClose }) => {
  const content = (
    <>
      <div className="flex-shrink-0 w-16 h-16 mr-4">
        <img src={ad.imageUrl!} alt="Advertisement" className="w-full h-full object-cover rounded-md" />
      </div>
      <div className="flex-grow text-yellow-800">
        <p className="font-bold text-sm leading-tight">{ad.text}</p>
      </div>
    </>
  );

  return (
    <div className="fixed bottom-4 left-4 z-40 w-80 max-w-[calc(100%-2rem)]">
        <div className="relative bg-gradient-to-br from-yellow-200 to-amber-200 border-2 border-yellow-300 rounded-xl shadow-2xl p-3 transition-transform duration-300 hover:scale-105">
            <button
                onClick={onClose}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                aria-label="Close ad"
            >
                &times;
            </button>
            {ad.link ? (
                <a href={ad.link} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                    {content}
                </a>
            ) : (
                <div className="flex items-center w-full">{content}</div>
            )}
        </div>
    </div>
  );
};

export default AdvertisementBanner;
