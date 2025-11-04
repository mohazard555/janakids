import React from 'react';
import type { AdSettings } from '../types';

interface AdvertisementBannerProps {
  ad: AdSettings;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({ ad }) => {
  const content = (
    <div className="w-full flex flex-col md:flex-row items-center bg-yellow-200/50 border-2 border-yellow-300 rounded-2xl shadow-lg p-4 md:p-2 mb-10">
      <div className="flex-shrink-0 w-32 h-32 md:w-24 md:h-24 mb-4 md:mb-0 md:mr-4">
        <img src={ad.imageUrl!} alt="Advertisement" className="w-full h-full object-cover rounded-lg" />
      </div>
      <div className="text-center md:text-right text-yellow-800">
        <p className="font-bold text-lg">{ad.text}</p>
      </div>
    </div>
  );

  if (ad.link) {
    return (
      <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block hover:scale-105 transition-transform duration-300">
        {content}
      </a>
    );
  }

  return content;
};

export default AdvertisementBanner;
