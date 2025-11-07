import React from 'react';
import type { Ad } from '../types';

interface AdsPanelProps {
    ads: Ad[];
    onClose: () => void;
}

const AdsPanel: React.FC<AdsPanelProps> = ({ ads, onClose }) => {
    return (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
            <div className="p-4 border-b flex justify-between items-center bg-yellow-50">
                <h3 className="font-bold text-yellow-800">🎁 عروض وهدايا</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {ads.length > 0 ? (
                    <ul>
                        {ads.map(ad => (
                            <li key={ad.id} className="border-b last:border-b-0">
                                <a 
                                  href={ad.link || '#'} 
                                  target={ad.link ? "_blank" : "_self"} 
                                  rel="noopener noreferrer" 
                                  className={`group flex items-center p-3 hover:bg-yellow-50 transition-colors duration-200 ${!ad.link && 'cursor-default'}`}
                                  onClick={(e) => !ad.link && e.preventDefault()}
                                >
                                    {ad.imageUrl && (
                                        <div className="relative w-16 h-12 flex-shrink-0">
                                            <img src={ad.imageUrl} alt={ad.text} className="w-full h-full object-cover rounded-md" />
                                        </div>
                                    )}
                                    <div className="mr-3 flex-1 overflow-hidden">
                                        <p className="text-sm text-gray-800 group-hover:text-yellow-700 font-bold transition-colors">{ad.text}</p>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-4 text-center text-gray-500">لا توجد عروض حالياً.</p>
                )}
            </div>
        </div>
    );
};

export default AdsPanel;
