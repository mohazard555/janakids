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
import AddActivityForm from './components/AddActivityForm';
import ActivityCard from './components/ActivityCard';
import type { Video, Playlist, Activity } from './types';

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

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [channelLogo, setChannelLogo] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [credentials, setCredentials] = useState({ username: "admin", password: "password" });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | 'all'>('all');
  const [channelDescription, setChannelDescription] = useState('');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      const persistedState = loadStateFromLocalStorage();
      if (persistedState) {
        setVideos(persistedState.videos ?? []);
        setShorts(persistedState.shorts ?? []);
        setActivities(persistedState.activities ?? []);
        setChannelLogo(persistedState.channelLogo ?? null);
        setPlaylists(persistedState.playlists ?? []);
        setChannelDescription(persistedState.channelDescription ?? '');
        setCredentials(persistedState.credentials ?? { username: "admin", password: "password" });
        setIsLoading(false);
      } else {
        try {
          const response = await fetch('/data.json');
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setVideos(data.INITIAL_VIDEOS ?? []);
          setShorts(data.INITIAL_SHORTS ?? []);
          setActivities(data.INITIAL_ACTIVITIES ?? []);
          setChannelLogo(data.INITIAL_CHANNEL_LOGO ?? null);
          setPlaylists(data.INITIAL_PLAYLISTS ?? []);
          setChannelDescription(data.INITIAL_CHANNEL_DESCRIPTION ?? '');
          setCredentials(data.INITIAL_CREDENTIALS ?? { username: "admin", password: "password" });
        } catch (error) {
          console.error("Failed to fetch initial data from data.json", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    // Don't save initial empty state on first render
    if (isLoading) return; 
    
    const appState = {
        videos,
        shorts,
        activities,
        channelLogo,
        playlists,
        channelDescription,
        credentials,
    };
    saveStateToLocalStorage(appState);
  }, [videos, shorts, activities, channelLogo, playlists, channelDescription, credentials, isLoading]);

  const handleExportData = () => {
    const dataToExport = {
        INITIAL_CHANNEL_LOGO: channelLogo,
        INITIAL_CHANNEL_DESCRIPTION: channelDescription,
        INITIAL_VIDEOS: videos,
        INITIAL_SHORTS: shorts,
        INITIAL_ACTIVITIES: activities,
        INITIAL_PLAYLISTS: playlists,
        INITIAL_CREDENTIALS: credentials,
    };
    const fileContent = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('تم إنشاء ملف البيانات. قم باستبدال ملف "data.json" في مشروعك لنشر التغييرات.');
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

  const handleAddActivity = (newActivityData: { title: string; description: string; imageFile: File }) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const newActivity: Activity = {
              id: Date.now(),
              title: newActivityData.title,
              description: newActivityData.description,
              imageUrl: reader.result as string,
          };
          setActivities(prev => [newActivity, ...prev]);
      };
      reader.readAsDataURL(newActivityData.imageFile);
  };

  const handleDeleteActivity = (activityId: number) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
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

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50">
            <div className="text-2xl font-bold text-sky-600 animate-pulse">
                ...جاري تحميل القناة
            </div>
        </div>
    );
  }

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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <AddVideoForm onAddVideo={handleAddVideo} />
                    <AddShortsForm onAddShort={handleAddShort} />
                    <AddActivityForm onAddActivity={handleAddActivity} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CreatePlaylistForm onCreatePlaylist={handleCreatePlaylist} />
                    <AdminSettings 
                        onCredentialsChange={setCredentials} 
                        currentCredentials={credentials}
                        onExportData={handleExportData} 
                    />
                </div>
            </div>
        )}
        
        {(shorts.length > 0 || isLoggedIn) && <ShortsCarousel shorts={shorts} onWatchNowClick={handleIncrementViewCount} />}

        {(activities.length > 0 || isLoggedIn) && (
            <div className="my-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-r-8 border-green-500 pr-4">
                    🎨 أنشطة تعليمية ومرحة
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {activities.map(activity => (
                        <ActivityCard 
                            key={activity.id}
                            activity={activity}
                            isAdmin={isLoggedIn}
                            onDeleteActivity={handleDeleteActivity}
                        />
                    ))}
                    {activities.length === 0 && isLoggedIn && (
                        <div className="col-span-full text-center py-16 bg-gray-100 rounded-2xl">
                            <p className="text-lg text-gray-500">
                                لم تتم إضافة أي أنشطة بعد. ابدأ بإضافة نشاط جديد!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )}

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