import React from 'react';

interface AdIconProps {
  count: number;
  onClick: () => void;
}

const AdIcon: React.FC<AdIconProps> = ({ count, onClick }) => {
  return (
    <button onClick={onClick} className="relative p-2 text-yellow-500 hover:text-yellow-600 transition-colors" aria-label={`View special offers. ${count} available.`}>
      {/* Gift Icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 5a3 3 0 013-3h4a3 3 0 013 3v1h-1.5a1.5 1.5 0 000 3H15v1a3 3 0 01-3 3H8a3 3 0 01-3-3V9H3.5a1.5 1.5 0 000-3H5V5zm5 4a1.5 1.5 0 00-1.5 1.5v1.5a1.5 1.5 0 003 0V10.5A1.5 1.5 0 0010 9zm-2.5-5a.5.5 0 000 1h5a.5.5 0 000-1h-5z" clipRule="evenodd" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-500 rounded-full border-2 border-white">
          {count}
        </span>
      )}
    </button>
  );
};

export default AdIcon;
