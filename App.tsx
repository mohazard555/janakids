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
import SearchBar from './components/SearchBar';
import NotificationBell from './components/NotificationBell';
import NotificationPanel from './components/NotificationPanel';
import AdvertisementBanner from './components/AdvertisementBanner';
import AdvertiserCta from './components/AdvertiserCta';
import SyncIndicator from './components/SyncIndicator';
import type { Video, Playlist, Activity, AdSettings, Ad } from './types';

interface GistSyncSettings {
    gistUrl: string;
    githubToken: string;
}

const CANONICAL_FILENAME = 'jana_kids_data.json';

const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const getGistId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/gist\.github(?:usercontent)?\.com\/[^\/]+\/([a-f0-9]+)/);
    return match ? match[1] : null;
};

const App: React.FC = () => {
  const defaultAdSettings: AdSettings = { 
    ads: [],
    ctaEnabled: false,
    ctaText: 'للإعلان معنا',
    ctaLink: ''
  };

  // Content State
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [channelLogo, setChannelLogo] = useState<string | null>(null);
  const [channelDescription, setChannelDescription] = useState('قناة جنى كيدز تقدم لكم أجمل قصص الأطفال التعليمية والترفيهية. انضموا إلينا في مغامرات شيقة وممتعة!');
  const [subscriptionUrl, setSubscriptionUrl] = useState<string>('');
  const [adSettings, setAdSettings] = useState<AdSettings>(defaultAdSettings);

  // App Control State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newVideoIds, setNewVideoIds] = useState<number[]>([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [isAdVisible, setIsAdVisible] = useState(true);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);

  // Settings State
  const [credentials, setCredentials] = useState({ username: "admin", password: "password" });
  const [syncSettings, setSyncSettings] = useState<GistSyncSettings>({ gistUrl: '', githubToken: '' });

  const syncTimerRef = useRef<number | null>(null);

  const migrateAdSettings = (loadedAdSettings: any): AdSettings => {
    if (loadedAdSettings && typeof loadedAdSettings.enabled !== 'undefined') {
        const oldSettings = loadedAdSettings;
        const newSettings: AdSettings = {
            ads: [],
            ctaEnabled: oldSettings.ctaEnabled ?? false,
            ctaText: oldSettings.ctaText ?? 'للإعلان معنا',
            ctaLink: oldSettings.ctaLink ?? ''
        };
        if (oldSettings.enabled && oldSettings.text && oldSettings.imageUrl) {
            newSettings.ads.push({
                id: Date.now(),
                text: oldSettings.text,
                imageUrl: oldSettings.imageUrl,
                link: oldSettings.link
            });
        }
        return newSettings;
    }
    return { ...defaultAdSettings, ...loadedAdSettings };
  };

  const setDataFromRemote = (data: any) => {
    const loadedVideos = data.videos ?? [];
    setVideos(loadedVideos);
    setShorts(data.shorts ?? []);
    setActivities(data.activities ?? []);
    setChannelLogo(data.channelLogo ?? null);
    setPlaylists(data.playlists ?? []);
    setChannelDescription(data.channelDescription ?? channelDescription);
    setSubscriptionUrl(data.subscriptionUrl ?? '');

    const migratedAdSettings = migrateAdSettings(data.adSettings);
    setAdSettings(migratedAdSettings);

    const seenVideosRaw = localStorage.getItem('janaKidsSeenVideos');
    const seenVideoIds: number[] = seenVideosRaw ? JSON.parse(seenVideosRaw) : [];
    const allVideoIds = loadedVideos.map((v: Video) => v.id);
    const newIds = allVideoIds.filter((id: number) => !seenVideoIds.includes(id));
    setNewVideoIds(newIds);
  };

  // Effect for initial data loading
  useEffect(() => {
    const loadInitialData = () => {
        setIsLoading(true);

        // Load settings and credentials from localStorage
        const savedSyncSettingsRaw = localStorage.getItem('janaKidsSyncSettings');
        if (savedSyncSettingsRaw) {
            try {
                const settings: GistSyncSettings = JSON.parse(savedSyncSettingsRaw);
                setSyncSettings(settings);
            } catch (e) {
                console.error("Could not parse sync settings from local storage.", e);
            }
        }
        const savedCredentials = localStorage.getItem('janaKidsCredentials');
        if (savedCredentials) {
            try {
                setCredentials(JSON.parse(savedCredentials));
            } catch (e) {
                 console.error("Could not parse credentials from local storage.", e);
            }
        }

        // Always load content from localStorage. This prevents remote data from overwriting local changes.
        const localDataRaw = localStorage.getItem('janaKidsContent');
        if (localDataRaw) {
            try {
                console.log("Loading data from local storage cache.");
                const localData = JSON.parse(localDataRaw);
                setDataFromRemote(localData);
            } catch (e) {
                console.error("Could not parse local content data.", e);
            }
        } else {
            console.log("No local data found. Starting with a fresh slate.");
        }

        setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // Effect to select a random ad to display
  useEffect(() => {
    if (adSettings.ads && adSettings.ads.length > 0) {
      const activeAds = adSettings.ads.filter(ad => ad.imageUrl);
      if (activeAds.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeAds.length);
        setCurrentAd(activeAds[randomIndex]);
      } else {
        setCurrentAd(null);
      }
    } else {
      setCurrentAd(null);
    }
  }, [adSettings.ads]);


  // Effect for syncing data to Gist on change (debounced)
  useEffect(() => {
    if (isLoading || !isLoggedIn || !syncSettings.gistUrl || !syncSettings.githubToken) {
      return;
    }

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(async () => {
      setIsSyncing(true);
      try {
        const gistId = getGistId(syncSettings.gistUrl);
        if (!gistId) {
          throw new Error("رابط Gist غير صالح. لا يمكن المزامنة.");
        }

        console.log(`Starting automatic sync for Gist ID: ${gistId}.`);
        
        const contentToSync = {
            videos,
            shorts,
            activities,
            channelLogo,
            playlists,
            channelDescription,
            subscriptionUrl,
            adSettings,
        };

        const GIST_API_URL = `https://api.github.com/gists/${gistId}`;
        const AUTH_HEADERS = {
            'Authorization': `token ${syncSettings.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        };
        
        const metaResponse = await fetch(GIST_API_URL, { headers: { 'Authorization': `token ${syncSettings.githubToken}`, 'Accept': 'application/vnd.github.v3+json' } });
        if (!metaResponse.ok) {
            const status = metaResponse.status;
            if (status === 404) throw new Error('فشل جلب Gist: لم يتم العثور عليه. يرجى التحقق من الرابط.');
            if (status === 401 || status === 403) throw new Error('فشل جلب Gist: خطأ في المصادقة. يرجى التحقق من صلاحيات GitHub Token.');
            const errorData = await metaResponse.json().catch(() => ({ message: 'فشل تحليل استجابة الخطأ' }));
            throw new Error(`فشل جلب Gist: ${errorData.message}`);
        }
        
        const gistData = await metaResponse.json();
        const currentFilenames = Object.keys(gistData.files);

        const filesToPatch: { [key: string]: any } = {};
        filesToPatch[CANONICAL_FILENAME] = {
            content: JSON.stringify(contentToSync, null, 2),
        };
        for (const filename of currentFilenames) {
            if (filename !== CANONICAL_FILENAME) {
                filesToPatch[filename] = null;
            }
        }
        
        const patchResponse = await fetch(GIST_API_URL, {
          method: 'PATCH',
          headers: AUTH_HEADERS,
          body: JSON.stringify({
            description: "Jana Kids Channel Data",
            files: filesToPatch,
          }),
        });

        if (!patchResponse.ok) {
          const status = patchResponse.status;
          if (status === 404) throw new Error('فشل الحفظ: لم يتم العثور على Gist. يرجى التحقق من الرابط.');
          if (status === 401 || status === 403) throw new Error('فشل الحفظ: خطأ في المصادقة. يرجى التحقق من صلاحيات GitHub Token.');
          const errorData = await patchResponse.json().catch(() => ({ message: 'فشل تحليل استجابة الخطأ' }));
          throw new Error(`فشل الحفظ: ${errorData.message}`);
        }
        
        console.log("Gist sync completed successfully.");
        setToastMessage({ text: 'تمت المزامنة بنجاح!', type: 'success' });

      } catch (error) {
        console.error("Failed to sync data to Gist:", error);
        setToastMessage({ text: (error as Error).message, type: 'error' });
      } finally {
        setIsSyncing(false);
      }

    }, 2000);

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings, isLoading, isLoggedIn, syncSettings]);

  // Effect for saving content to local storage on any change
  useEffect(() => {
    if (isLoading) return;
    const contentToSave = {
        videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings,
    };
    localStorage.setItem('janaKidsContent', JSON.stringify(contentToSave));
  }, [videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings, isLoading]);


  useEffect(() => {
    if(!isLoading) localStorage.setItem('janaKidsCredentials', JSON.stringify(credentials));
  }, [credentials, isLoading]);

  const handleConfigureAndSync = async (settings: GistSyncSettings) => {
    setIsSyncing(true);
    try {
        const gistId = getGistId(settings.gistUrl);
        if (!gistId) throw new Error("رابط Gist غير صالح.");
        if (!settings.githubToken) throw new Error("رمز GitHub مطلوب.");

        const contentToSync = {
            videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings,
        };

        const GIST_API_URL = `https://api.github.com/gists/${gistId}`;
        const AUTH_HEADERS = {
            'Authorization': `token ${settings.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
        };

        const metaResponse = await fetch(GIST_API_URL, { headers: AUTH_HEADERS });
        if (!metaResponse.ok) {
            const status = metaResponse.status;
            if (status === 404) throw new Error('فشل الاتصال: لم يتم العثور على Gist.');
            if (status === 401 || status === 403) throw new Error('فشل الاتصال: خطأ في المصادقة.');
            throw new Error(`فشل الاتصال: خطأ من الخادم (Status: ${status})`);
        }
        
        const gistData = await metaResponse.json();
        const currentFilenames = Object.keys(gistData.files);

        const filesToPatch: { [key: string]: any } = {};
        filesToPatch[CANONICAL_FILENAME] = { content: JSON.stringify(contentToSync, null, 2) };
        for (const filename of currentFilenames) {
            if (filename !== CANONICAL_FILENAME) filesToPatch[filename] = null;
        }

        const patchResponse = await fetch(GIST_API_URL, {
            method: 'PATCH',
            headers: { ...AUTH_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: "Jana Kids Channel Data", files: filesToPatch }),
        });

        if (!patchResponse.ok) {
            const errorData = await patchResponse.json().catch(() => ({ message: 'فشل تحليل استجابة الخطأ' }));
            throw new Error(`فشل حفظ البيانات في Gist: ${errorData.message}`);
        }

        setSyncSettings(settings);
        localStorage.setItem('janaKidsSyncSettings', JSON.stringify(settings));
        
        setToastMessage({ text: 'تم ربط ومزامنة البيانات بنجاح!', type: 'success' });
    } catch (error) {
        setToastMessage({ text: (error as Error).message, type: 'error' });
        throw error;
    } finally {
        setIsSyncing(false);
    }
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
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      views: 0,
    };
    setVideos(prev => [newVideo, ...prev]);
    setNewVideoIds(prev => [newVideo.id, ...prev]);
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
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
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
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const updater = (list: Video[]) => list.map(v => v.id === updatedData.id ? { ...v, ...updatedData, thumbnailUrl } : v);
    setVideos(updater);
    setShorts(updater);
    setEditingVideo(null);
  };

   const handleAdSettingsChange = (newSettings: AdSettings) => {
    setAdSettings(newSettings);
    setToastMessage({ text: 'تم تحديث إعدادات الإعلان بنجاح!', type: 'success' });
  };

  const handleToggleNotifications = () => {
      setShowNotificationsPanel(prev => !prev);
      if (!showNotificationsPanel && newVideoIds.length > 0) {
          const allCurrentVideoIds = videos.map(v => v.id);
          localStorage.setItem('janaKidsSeenVideos', JSON.stringify(allCurrentVideoIds));
          setNewVideoIds([]);
      }
  };

  const videosToDisplay = (selectedPlaylistId === 'all' 
    ? videos 
    : videos.filter(v => playlists.find(p => p.id === selectedPlaylistId)?.videoIds.includes(v.id))
  ).filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newVideosList = videos.filter(v => newVideoIds.includes(v.id));

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
        videoCount={videos.length}
        subscriptionUrl={subscriptionUrl}
      />
      <main className="container mx-auto px-4 py-10">
        <div className="my-8 flex justify-between items-center relative">
            <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
            <NotificationBell count={newVideoIds.length} onClick={handleToggleNotifications} />
            {showNotificationsPanel && (
              <NotificationPanel 
                newVideos={newVideosList}
                onClose={() => setShowNotificationsPanel(false)}
              />
            )}
        </div>
        
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
                        onSubscriptionUrlChange={setSubscriptionUrl}
                        currentSubscriptionUrl={subscriptionUrl}
                        onConfigureAndSync={handleConfigureAndSync}
                        currentSyncSettings={syncSettings}
                        onAdSettingsChange={handleAdSettingsChange}
                        currentAdSettings={adSettings}
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
                    {searchQuery ? `لا توجد نتائج بحث عن "${searchQuery}"` : 'لم تتم إضافة أي فيديوهات بعد.'}
                </p>
            </div>
          )}
        </div>
      </main>

      {currentAd && isAdVisible && (
        <AdvertisementBanner ad={currentAd} onClose={() => setIsAdVisible(false)} />
      )}

      {adSettings.ctaEnabled && <AdvertiserCta settings={adSettings} />}
      
      <Footer />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      {isLoggedIn && <SyncIndicator isSyncing={isSyncing} />}
    </div>
  );
};

export default App;