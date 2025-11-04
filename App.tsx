import React, { useState, useEffect, useRef } from 'react';
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
import Toast, { ToastMessage } from './components/Toast';
import type { Video, Playlist, Activity } from './types';

interface GistSyncSettings {
    gistUrl: string;
    githubToken: string;
}

const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const getGistId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/gist\.githubusercontent\.com\/[^\/]+\/([a-f0-9]+)\/raw/);
    return match ? match[1] : null;
};

const App: React.FC = () => {
  // Content State
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [channelLogo, setChannelLogo] = useState<string | null>(null);
  const [channelDescription, setChannelDescription] = useState('قناة جنى كيدز تقدم لكم أجمل قصص الأطفال التعليمية والترفيهية. انضموا إلينا في مغامرات شيقة وممتعة!');
  
  // App Control State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  // Settings State
  const [credentials, setCredentials] = useState({ username: "admin", password: "password" });
  const [syncSettings, setSyncSettings] = useState<GistSyncSettings>({ gistUrl: '', githubToken: '' });

  const syncTimerRef = useRef<number | null>(null);

  // Effect for initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      const savedSyncSettings = localStorage.getItem('janaKidsSyncSettings');
      const savedCredentials = localStorage.getItem('janaKidsCredentials');

      if (savedCredentials) {
        setCredentials(JSON.parse(savedCredentials));
      }

      if (savedSyncSettings) {
        const settings: GistSyncSettings = JSON.parse(savedSyncSettings);
        setSyncSettings(settings);
        if (settings.gistUrl) {
          try {
            const fetchUrl = `${settings.gistUrl}?cache_bust=${new Date().getTime()}`;
            console.log("Fetching data from Gist:", fetchUrl);
            const response = await fetch(fetchUrl);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setVideos(data.videos ?? []);
            setShorts(data.shorts ?? []);
            setActivities(data.activities ?? []);
            setChannelLogo(data.channelLogo ?? null);
            setPlaylists(data.playlists ?? []);
            setChannelDescription(data.channelDescription ?? '');
            console.log("Data loaded successfully from Gist.");
          } catch (error) {
            console.error("Failed to fetch initial data from Gist", error);
            setToastMessage({ text: 'فشل تحميل البيانات من Gist. قد ترى محتوى قديماً.', type: 'error' });
          }
        }
      } else {
        console.log("No Gist sync settings found. Starting with a blank slate.");
      }
      
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // Effect for syncing data to Gist on change (debounced)
  useEffect(() => {
    if (isLoading || !isLoggedIn || !syncSettings.gistUrl || !syncSettings.githubToken) {
      return;
    }

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(async () => {
      const gistId = getGistId(syncSettings.gistUrl);
      const filename = syncSettings.gistUrl.split('/').pop();

      if (!gistId || !filename) {
        console.error("Invalid Gist URL format. Cannot extract Gist ID or filename.");
        setToastMessage({ text: 'رابط Gist غير صالح. لا يمكن المزامنة.', type: 'error' });
        return;
      }
      
      console.log("Syncing data to Gist...");

      const contentToSync = {
        videos,
        shorts,
        activities,
        channelLogo,
        playlists,
        channelDescription,
      };

      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${syncSettings.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            files: {
              [filename]: {
                content: JSON.stringify(contentToSync, null, 2),
              },
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`GitHub API Error: ${errorData.message}`);
        }
        console.log("Data synced to Gist successfully.");
        setToastMessage({ text: 'تمت المزامنة بنجاح!', type: 'success' });
      } catch (error) {
        console.error("Failed to sync data to Gist:", error);
        setToastMessage({ text: `فشل المزامنة: ${error.message}`, type: 'error' });
      }

    }, 2000); // 2-second debounce

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [videos, shorts, activities, channelLogo, playlists, channelDescription, isLoading, isLoggedIn, syncSettings]);

  // Effect for saving credentials locally
  useEffect(() => {
    if(!isLoading) {
        localStorage.setItem('janaKidsCredentials', JSON.stringify(credentials));
    }
  }, [credentials, isLoading]);

  const handleSyncSettingsChange = (newSettings: GistSyncSettings) => {
      setSyncSettings(newSettings);
      localStorage.setItem('janaKidsSyncSettings', JSON.stringify(newSettings));
      alert("تم حفظ إعدادات المزامنة. سيتم إعادة تحميل الصفحة لتطبيق التغييرات.");
      window.location.reload();
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setChannelLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddVideo = (data: { title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(data.youtubeUrl);
    if (!videoId) {
      alert('رابط يوتيوب غير صالح.');
      return;
    }
    const newVideo: Video = {
      id: Date.now(),
      title: data.title,
      youtubeUrl: data.youtubeUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      views: 0,
    };
    setVideos(prev => [newVideo, ...prev]);
  };

  const handleAddShort = (data: { title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(data.youtubeUrl);
    if (!videoId) {
      alert('رابط يوتيوب غير صالح.');
      return;
    }
    const newShort: Video = {
      id: Date.now(),
      title: data.title,
      youtubeUrl: data.youtubeUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      views: 0,
    };
    setShorts(prev => [newShort, ...prev]);
  };

  const handleAddActivity = (data: { title: string; description: string; imageFile: File }) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newActivity: Activity = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        imageUrl: reader.result as string,
      };
      setActivities(prev => [newActivity, ...prev]);
    };
    reader.readAsDataURL(data.imageFile);
  };
  
  const handleIncrementViewCount = (videoId: number) => {
    const increment = (list: Video[]) => list.map(v => v.id === videoId ? { ...v, views: (v.views || 0) + 1 } : v);
    setVideos(increment);
    setShorts(increment);
  };

  const handleCreatePlaylist = (name: string) => {
    const newPlaylist: Playlist = { id: Date.now(), name, videoIds: [] };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const handleAddToPlaylist = (videoId: number, playlistId: number) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId && !p.videoIds.includes(videoId)) {
        return { ...p, videoIds: [...p.videoIds, videoId] };
      }
      return p;
    }));
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
    setPlaylists(prev => prev.map(p => ({ ...p, videoIds: p.videoIds.filter(id => id !== videoId) })));
  };

  const handleDeleteActivity = (activityId: number) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const handleUpdateVideo = (updatedData: { id: number; title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(updatedData.youtubeUrl);
    if (!videoId) {
      alert('رابط يوتيوب غير صالح.');
      return;
    }
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
    const updater = (list: Video[]) => list.map(v => v.id === updatedData.id ? { ...v, ...updatedData, thumbnailUrl } : v);
    setVideos(updater);
    setShorts(updater);
    setEditingVideo(null);
  };

  const videosToDisplay = selectedPlaylistId === 'all' 
    ? videos 
    : videos.filter(v => playlists.find(p => p.id === selectedPlaylistId)?.videoIds.includes(v.id));

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
      <div className="absolute top-1/4 left-5 sm:left-10 text-8xl opacity-10 select-none -z-10 transform -rotate-12 pointer-events-none" aria-hidden="true">🦁</div>
      <div className="absolute top-1/2 right-5 sm:right-10 text-8xl opacity-10 select-none -z-10 transform rotate-12 pointer-events-none" aria-hidden="true">🐘</div>

      {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
      
      {editingVideo && <EditVideoModal video={editingVideo} onUpdate={handleUpdateVideo} onClose={() => setEditingVideo(null)} />}

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
                        onSyncSettingsChange={handleSyncSettingsChange}
                        currentSyncSettings={syncSettings}
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
                        <ActivityCard key={activity.id} activity={activity} isAdmin={isLoggedIn} onDeleteActivity={handleDeleteActivity} />
                    ))}
                    {activities.length === 0 && isLoggedIn && (
                        <div className="col-span-full text-center py-16 bg-gray-100 rounded-2xl"><p className="text-lg text-gray-500">ابدأ بإضافة نشاط جديد!</p></div>
                    )}
                </div>
            </div>
        )}

        <PlaylistTabs playlists={playlists} selectedId={selectedPlaylistId} onSelect={setSelectedPlaylistId} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videosToDisplay.length > 0 ? (
            videosToDisplay.map((video) => (
              <VideoCard 
                key={video.id} video={video} isAdmin={isLoggedIn} playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
                onDeleteVideo={handleDeleteVideo}
                onEditVideo={setEditingVideo}
                onWatchNowClick={handleIncrementViewCount}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
                <p className="text-2xl text-gray-500">
                    {syncSettings.gistUrl ? 'لم تتم إضافة أي فيديوهات بعد.' : 'الرجاء إعداد المزامنة في لوحة تحكم الأدمن لعرض المحتوى.'}
                </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};

export default App;
