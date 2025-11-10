import React, { useState, useRef, useEffect } from 'react';
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

const ShareIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);

// Social Media & Utility Icons for Share Popover
const WhatsAppIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;
const FacebookIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>;
const TwitterIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const TelegramIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15.91L18.23 21.2c-.24.62-.85.78-1.4.49l-4.78-3.52-2.33 2.24c-.25.24-.46.44-.7.44z"/></svg>;
const LinkIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>;


const VideoCard: React.FC<VideoCardProps> = ({ video, isAdmin, playlists, onAddToPlaylist, onDeleteVideo, onEditVideo, onWatchNowClick }) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const shareContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


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

  const handleShareToggle = () => {
    setShowShareOptions(prev => !prev);
  };
    
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(video.youtubeUrl);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setShowShareOptions(false); // Optional: close menu after copy
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
      alert('لم نتمكن من نسخ الرابط.');
    }
  };

  const shareText = encodeURIComponent(`شاهد هذا الفيديو الرائع للأطفال: ${video.title}`);
  const shareUrl = encodeURIComponent(video.youtubeUrl);

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
          <div className="flex items-center space-x-2 space-x-reverse">
             <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onWatchNowClick(video.id)}
              className="bg-pink-500 text-white font-bold py-2 px-6 rounded-full hover:bg-pink-600 transition-colors duration-300 shadow-md"
            >
              مشاهدة الآن
            </a>
            <div className="relative" ref={shareContainerRef}>
                <button
                onClick={handleShareToggle}
                className="bg-sky-500 text-white font-bold p-2 rounded-full hover:bg-sky-600 transition-colors duration-300 shadow-md flex items-center justify-center"
                aria-label={`مشاركة فيديو: ${video.title}`}
                >
                <ShareIcon />
                </button>
                {showShareOptions && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 animate-fade-in-fast p-2 space-y-1">
                        <a href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full text-right p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors">
                            <WhatsAppIcon /> <span className="mr-3 flex-1">واتساب</span>
                        </a>
                         <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full text-right p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors">
                            <FacebookIcon /> <span className="mr-3 flex-1">فيسبوك</span>
                        </a>
                        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full text-right p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors">
                            <TwitterIcon /> <span className="mr-3 flex-1">تويتر</span>
                        </a>
                        <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full text-right p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors">
                            <TelegramIcon /> <span className="mr-3 flex-1">تيليجرام</span>
                        </a>
                        <div className="border-t border-gray-200 my-1 mx-2"></div>
                        <button onClick={handleCopyLink} className="flex items-center w-full text-right p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50" disabled={isCopied}>
                            <LinkIcon />
                            <span className="mr-3 flex-1">{isCopied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                        </button>
                    </div>
                )}
            </div>
          </div>
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
