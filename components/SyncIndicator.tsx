import React from 'react';

interface SyncIndicatorProps {
  isSyncing: boolean;
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({ isSyncing }) => {
  if (!isSyncing) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 z-50 flex items-center bg-sky-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg transition-opacity duration-300 animate-fade-in"
      aria-live="assertive"
      role="status"
    >
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      جاري المزامنة...
    </div>
  );
};

export default SyncIndicator;
