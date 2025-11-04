import React from 'react';
import type { AdSettings } from '../types';

interface AdvertiserCtaProps {
  settings: Pick<AdSettings, 'ctaText' | 'ctaLink'>;
}

const MegaphoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 14h4v4a1 1 0 001 1h4a1 1 0 001-1v-4h4a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM8.293 14H5.414l.293-.293A1 1 0 006 13v-1h2.293a1 1 0 00.707-.293l.293-.293L10 12l.707.707.293.293a1 1 0 00.707.293H14v1a1 1 0 00.293.707l.293.293h-2.879a1 1 0 00-.707.293L10 16l-.707-.707a1 1 0 00-.707-.293z" />
    </svg>
);

const AdvertiserCta: React.FC<AdvertiserCtaProps> = ({ settings }) => {
  const content = (
    <div className="flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold py-3 px-5 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
      <MegaphoneIcon />
      <span>{settings.ctaText}</span>
    </div>
  );

  const wrapperClasses = "fixed bottom-4 right-4 z-40 cursor-pointer";

  if (settings.ctaLink) {
    return (
      <a href={settings.ctaLink} target="_blank" rel="noopener noreferrer" className={wrapperClasses}>
        {content}
      </a>
    );
  }

  return <div className={wrapperClasses}>{content}</div>;
};

export default AdvertiserCta;
