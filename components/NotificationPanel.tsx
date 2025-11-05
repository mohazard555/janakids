import React from 'react';
import type { Video } from '../types';

interface NotificationPanelProps {
    newVideos: Video[];
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ newVideos, onClose }) => {
    return (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">إشعارات جديدة</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {newVideos.length > 0 ? (
                    <ul>
                        {newVideos.map(video => (
                            <li key={video.id} className="border-b last:border-b-0">
                                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center p-3 hover:bg-sky-50 transition-colors duration-200">
                                    <div className="relative w-16 h-12 flex-shrink-0">
                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute inset-0 bg-black/60 rounded-md flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mr-3 flex-1 overflow-hidden">
                                        <p className="text-sm text-gray-800 group-hover:text-sky-600 font-bold truncate transition-colors">{video.title}</p>
                                        <p className="text-xs text-sky-700 transform translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 font-semibold">
                                            ادخل للمشاهدة
                                        </p>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-4 text-center text-gray-500">لا توجد إشعارات جديدة.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;