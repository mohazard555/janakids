import React, { useState } from 'react';
import type { Video, Playlist } from '../types';

interface VideoCardProps {
  video: Video;
  isAdmin: boolean;
  playlists: Playlist[];
  onAddToPlaylist: (videoId: number, playlistId: number) => void;
  onDeleteVideo: (videoId: number) => void;
  onEditVideo: (video: Video) => void;
  onWatchNowClick: (videoId: number) => void;
}

const EyeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);


const VideoCard: React.FC<VideoCardProps> = ({ video, isAdmin, playlists, onAddToPlaylist, onDeleteVideo, onEditVideo, onWatchNowClick }) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');

  const handleAddToPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlaylistId) {
        onAddToPlaylist(video.id, parseInt(selectedPlaylistId, 10));
        alert(`تمت إضافة الفيديو إلى قائمة التشغيل`);
    }
  };

  const handleDelete = () => {
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا الفيديو؟')) {
      onDeleteVideo(video.id);
    }
  }
    
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      <div className="w-full aspect-[4/3] bg-gray-200">
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 h-16">{video.title}</h3>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center bg-sky-100 text-sky-800 rounded-full px-3 py-1 text-sm">
            <span className="font-bold">{video.views.toLocaleString('ar-EG')}</span>
            <EyeIcon />
          </div>
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWatchNowClick(video.id)}
            className="bg-pink-500 text-white font-bold py-2 px-6 rounded-full hover:bg-pink-600 transition-colors duration-300 shadow-md"
          >
            مشاهدة الآن
          </a>
        </div>
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditVideo(video)}
                className="w-full bg-yellow-400 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors text-sm"
              >
                تعديل
              </button>
              <button
                onClick={handleDelete}
                className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                حذف
              </button>
            </div>
            {playlists.length > 0 && (
              <form onSubmit={handleAddToPlaylist} className="flex items-center space-x-2">
                <select
                  value={selectedPlaylistId}
                  onChange={(e) => setSelectedPlaylistId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400"
                >
                  <option value="" disabled>اختر قائمة تشغيل...</option>
                  {playlists.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors text-sm whitespace-nowrap"
                  disabled={!selectedPlaylistId}
                >
                  إضافة
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;