import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoCard from './components/VideoCard';
import AddVideoForm from './components/AddVideoForm';
import Footer from './components/Footer';
import CreatePlaylistForm from './components/CreatePlaylistForm';
import PlaylistTabs from './components/PlaylistTabs';
import LoginModal from './components/LoginModal';
import AdminSettings from './components/AdminSettings';
import AddShortsForm from './components/AddShortsForm';
import ShortsCarousel from './components/ShortsCarousel';
import EditVideoModal from './components/EditVideoModal';
import type { Video, Playlist } from './types';
import { 
    INITIAL_VIDEOS, 
    INITIAL_SHORTS, 
    INITIAL_PLAYLISTS, 
    INITIAL_CREDENTIALS,
    INITIAL_CHANNEL_DESCRIPTION 
} from './data';

const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  // Standard, short, and shorts URLs
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const loadStateFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('janaKidsAppState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (e) {
        console.warn("Could not load state from localStorage", e);
        return undefined;
    }
};

const saveStateToLocalStorage = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('janaKidsAppState', serializedState);
    } catch (e) {
        console.warn("Could not save state to localStorage", e);
    }
};

const persistedState = loadStateFromLocalStorage();

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>(persistedState?.videos ?? INITIAL_VIDEOS);
  const [shorts, setShorts] = useState<Video[]>(persistedState?.shorts ?? INITIAL_SHORTS);
  const [channelLogo, setChannelLogo] = useState<string | null>(persistedState?.channelLogo ?? null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [credentials, setCredentials] = useState(persistedState?.credentials ?? INITIAL_CREDENTIALS);
  const [playlists, setPlaylists] = useState<Playlist[]>(persistedState?.playlists ?? INITIAL_PLAYLISTS);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | 'all'>('all');
  const [channelDescription, setChannelDescription] = useState(persistedState?.channelDescription ?? INITIAL_CHANNEL_DESCRIPTION);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  useEffect(() => {
    const appState = {
        videos,
        shorts,
        channelLogo,
        playlists,
        channelDescription,
        credentials,
    };
    saveStateToLocalStorage(appState);
  }, [videos, shorts, channelLogo, playlists, channelDescription, credentials]);

  const handleExportData = () => {
    const fileContent = `import type { Video, Playlist } from './types';

export const INITIAL_CHANNEL_DESCRIPTION: string = ${JSON.stringify(channelDescription, null, 2)};

export const INITIAL_VIDEOS: Video[] = ${JSON.stringify(videos, null, 2)};

export const INITIAL_SHORTS: Video[] = ${JSON.stringify(shorts, null, 2)};

export const INITIAL_PLAYLISTS: Playlist[] = ${JSON.stringify(playlists, null, 2)};

export const INITIAL_CREDENTIALS = { username: ${JSON.stringify(credentials.username)}, password: ${JSON.stringify(credentials.password)} };
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.ts.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('تم إنشاء ملف البيانات. قم بنسخ محتواه إلى ملف "data.ts" في مشروعك لنشر التغييرات.');
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        setChannelLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddVideo = (newVideoData: { title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(newVideoData.youtubeUrl);
    if (!videoId) {
        alert('رابط يوتيوب غير صالح. الرجاء التأكد من الرابط والمحاولة مرة أخرى.');
        return;
    }
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

    const newVideo: Video = {
      id: Date.now(),
      title: newVideoData.title,
      youtubeUrl: newVideoData.youtubeUrl,
      thumbnailUrl,
      views: 0, 
    };
    setVideos(prevVideos => [newVideo, ...prevVideos]);
  };

  const handleAddShort = (newShortData: { title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(newShortData.youtubeUrl);
    if (!videoId) {
      alert('رابط يوتيوب غير صالح للشورتات. الرجاء التأكد من الرابط والمحاولة مرة أخرى.');
      return;
    }
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

    const newShort: Video = {
      id: Date.now(),
      title: newShortData.title,
      youtubeUrl: newShortData.youtubeUrl,
      thumbnailUrl,
      views: 0,
    };
    setShorts(prev => [newShort, ...prev]);
  };
  
  const handleIncrementViewCount = (videoId: number) => {
    const increment = (videoList: Video[]) =>
      videoList.map(video =>
        video.id === videoId ? { ...video, views: (video.views || 0) + 1 } : video
      );
    setVideos(increment);
    setShorts(increment);
  };


  const handleCreatePlaylist = (name: string) => {
    const newPlaylist: Playlist = {
        id: Date.now(),
        name,
        videoIds: [],
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const handleAddToPlaylist = (videoId: number, playlistId: number) => {
    setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => {
            if (playlist.id === playlistId) {
                if (playlist.videoIds.includes(videoId)) return playlist;
                return { ...playlist, videoIds: [...playlist.videoIds, videoId] };
            }
            return playlist;
        })
    );
  };
  
  const handleLogin = (user: string, pass: string): boolean => {
    if (user === credentials.username && pass === credentials.password) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const handleDeleteVideo = (videoId: number) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    setShorts(prev => prev.filter(s => s.id !== videoId));
    setPlaylists(prev => 
      prev.map(playlist => ({
        ...playlist,
        videoIds: playlist.videoIds.filter(id => id !== videoId)
      }))
    );
  };

  const handleUpdateVideo = (updatedVideoData: { id: number; title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(updatedVideoData.youtubeUrl);
    if (!videoId) {
        alert('رابط يوتيوب غير صالح. الرجاء التأكد من الرابط والمحاولة مرة أخرى.');
        return;
    }
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
    
    const updater = (prevVideos: Video[]) => 
      prevVideos.map(video =>
        video.id === updatedVideoData.id
            ? { ...video, ...updatedVideoData, thumbnailUrl }
            : video
      );

    setVideos(updater);
    setShorts(updater);

    setEditingVideo(null);
  };

  const videosToDisplay = selectedPlaylistId === 'all' 
    ? videos 
    : videos.filter(video => 
        playlists.find(p => p.id === selectedPlaylistId)?.videoIds.includes(video.id)
    );

  return (
    <div className="min-h-screen relative">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-5 sm:left-10 text-8xl opacity-10 select-none -z-10 transform -rotate-12 pointer-events-none" aria-hidden="true">🦁</div>
      <div className="absolute top-1/2 right-5 sm:right-10 text-8xl opacity-10 select-none -z-10 transform rotate-12 pointer-events-none" aria-hidden="true">🐘</div>
      <div className="absolute bottom-1/4 left-1/3 text-6xl opacity-10 select-none -z-10 transform rotate-6 pointer-events-none" aria-hidden="true">🦒</div>
      <div className="absolute top-3/4 right-1/4 text-7xl opacity-10 select-none -z-10 transform -rotate-6 pointer-events-none" aria-hidden="true">🐒</div>
      <div className="absolute top-20 right-1/3 text-5xl opacity-15 select-none -z-10 pointer-events-none" aria-hidden="true">🌸</div>
      <div className="absolute bottom-10 left-10 text-6xl opacity-15 select-none -z-10 pointer-events-none" aria-hidden="true">⭐</div>
      <div className="absolute top-3/4 left-1/4 text-8xl opacity-10 select-none -z-10 pointer-events-none" aria-hidden="true">☀️</div>

      {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
      
      {editingVideo && (
        <EditVideoModal 
            video={editingVideo}
            onUpdate={handleUpdateVideo}
            onClose={() => setEditingVideo(null)}
        />
      )}

      <Header 
        logo={channelLogo} 
        onLogoUpload={handleLogoUpload} 
        isLoggedIn={isLoggedIn} 
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={() => setIsLoggedIn(false)}
        channelDescription={channelDescription}
        onDescriptionChange={setChannelDescription}
      />
      <main className="container mx-auto px-4 py-10">
        {isLoggedIn && (
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl shadow-lg mb-12 border border-sky-200">
                <h2 className="text-4xl font-black text-center text-sky-700 mb-8">لوحة تحكم الأدمن</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AddVideoForm onAddVideo={handleAddVideo} />
                    <CreatePlaylistForm onCreatePlaylist={handleCreatePlaylist} />
                    <AddShortsForm onAddShort={handleAddShort} />
                    <AdminSettings 
                        onCredentialsChange={setCredentials} 
                        currentCredentials={credentials}
                        onExportData={handleExportData} 
                    />
                </div>
            </div>
        )}
        
        {(shorts.length > 0 || isLoggedIn) && <ShortsCarousel shorts={shorts} onWatchNowClick={handleIncrementViewCount} />}

        <PlaylistTabs playlists={playlists} selectedId={selectedPlaylistId} onSelect={setSelectedPlaylistId} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videosToDisplay.length > 0 ? (
            videosToDisplay.map((video) => (
              <VideoCard 
                key={video.id} 
                video={video} 
                isAdmin={isLoggedIn}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
                onDeleteVideo={handleDeleteVideo}
                onEditVideo={setEditingVideo}
                onWatchNowClick={handleIncrementViewCount}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
                <p className="text-2xl text-gray-500">
                    {isLoggedIn && selectedPlaylistId === 'all' 
                        ? 'لم تتم إضافة أي فيديوهات بعد. ابدأ بإضافة فيديو جديد!'
                        : 'قائمة التشغيل هذه فارغة.'
                    }
                </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;