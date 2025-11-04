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
                                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 hover:bg-sky-50 transition-colors">
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-16 h-12 object-cover rounded-md flex-shrink-0" />
                                    <p className="text-sm text-gray-700 mr-3 line-clamp-2">{video.title}</p>
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
