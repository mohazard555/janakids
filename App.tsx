
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
import AdIcon from './components/AdIcon';
import AdsPanel from './components/AdsPanel';
import AdvertiserCta from './components/AdvertiserCta';
import SyncIndicator from './components/SyncIndicator';
import type { Video, Playlist, Activity, AdSettings, Ad } from './types';


// ====================================================================================
// ====================================================================================
// =================== خطوة إعداد لمرة واحدة: من فضلك قم بلصق الرابط هنا ===================
// ====================================================================================
//
// 1. اذهب إلى ملف `jana_kids_data.json` الخاص بك على GitHub Gist.
// 2. اضغط على زر "Raw" لعرض المحتوى الخام للملف.
// 3. انسخ الرابط (URL) بالكامل من شريط عنوان المتصفح.
// 4. ألصق الرابط المنسخ أدناه بين علامتي الاقتباس "".
//
// مثال: "https://gist.githubusercontent.com/your-username/abcdef123456/raw/jana_kids_data.json"
//
const GIST_RAW_URL = "https://gist.githubusercontent.com/mohazard555/d6be309aba18145be395d6ee0bc7ca7a/raw/jana_kids_data.json"; 
//
// ====================================================================================


interface GistSyncSettings {
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

const GIST_ID = getGistId(GIST_RAW_URL);
// Using a unique namespace for the central view counter based on the Gist ID
const COUNTER_NAMESPACE = GIST_ID ? `janakids-${GIST_ID}` : null;


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
  const [baseVideos, setBaseVideos] = useState<Video[]>([]);
  const [baseShorts, setBaseShorts] = useState<Video[]>([]);
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
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newVideoIds, setNewVideoIds] = useState<number[]>([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [showAdsPanel, setShowAdsPanel] = useState(false);

  // Settings State
  const [credentials, setCredentials] = useState({ username: "admin", password: "password" });
  const [syncSettings, setSyncSettings] = useState<GistSyncSettings>({ githubToken: '' });

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
    const loadedShorts = data.shorts ?? [];

    setBaseVideos(loadedVideos);
    setBaseShorts(loadedShorts);

    setVideos(loadedVideos);
    setShorts(loadedShorts);
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
  
  // Effect for initial data loading from Gist with localStorage caching.
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setLoadingError(null); // Reset error state on every load attempt

      // Load admin-specific settings from localStorage
      const savedCredentials = localStorage.getItem('janaKidsCredentials');
      if (savedCredentials) {
        try { setCredentials(JSON.parse(savedCredentials)); } catch (e) { console.error("Could not parse credentials.", e); }
      }
      const savedSyncSettingsRaw = localStorage.getItem('janaKidsSyncSettings');
      if (savedSyncSettingsRaw) {
        try {
            const settings = JSON.parse(savedSyncSettingsRaw);
            setSyncSettings({ githubToken: settings.githubToken || '' });
        } catch(e) { console.error("Could not parse sync settings.", e); }
      }

      // --- Optimized Loading Strategy ---
      let initialDataLoaded = false;
      const localDataRaw = localStorage.getItem('janaKidsContent');
      let localData: any = null;
      
      // 1. Attempt to load from localStorage for an instant UI
      if (localDataRaw) {
          try {
              console.log("Applying data from localStorage cache for instant UI.");
              localData = JSON.parse(localDataRaw);
              setDataFromRemote(localData);
              initialDataLoaded = true;
          } catch (e) {
              console.error("Corrupt local data, removing.", e);
              localStorage.removeItem('janaKidsContent');
          }
      }

      // 2. Always fetch from the network to get the latest version.
      if (GIST_RAW_URL) {
          try {
              const response = await fetch(`${GIST_RAW_URL}?v=${new Date().getTime()}`);
              if (!response.ok) throw new Error(`فشل الاتصال بالخادم (Status: ${response.status})`);
              
              const remoteData = await response.json();

              // Fetch live view counts from central counter service
              if (COUNTER_NAMESPACE) {
                  try {
                      console.log("Fetching live view counts...");
                      const fetchCounts = async (items: Video[]) => {
                          const promises = items.map(item =>
                              fetch(`https://api.countapi.xyz/get/${COUNTER_NAMESPACE}/item-${item.id}`)
                                  .then(res => res.ok ? res.json() : { value: 0 })
                                  .then(data => ({ id: item.id, views: data.value || 0 }))
                                  .catch(() => ({ id: item.id, views: 0 }))
                          );
                          const results = await Promise.all(promises);
                          const viewsMap = new Map(results.map(r => [r.id, r.views]));
                          return items.map(item => ({
                              ...item,
                              views: Math.max(item.views || 0, viewsMap.get(item.id) || 0),
                          }));
                      };
                      
                      remoteData.videos = await fetchCounts(remoteData.videos || []);
                      remoteData.shorts = await fetchCounts(remoteData.shorts || []);
                      console.log("Live view counts merged.");

                  } catch (e) {
                      console.warn("Could not fetch live view counts, using Gist data as fallback.", e);
                  }
              }

              // Merge locally incremented view counts with the official data.
              if (localData) {
                const mergeViews = (remoteList: Video[] = [], localList: Video[] = []) => {
                    const localViewsMap = new Map(localList.map(v => [v.id, v.views]));
                    return remoteList.map(remoteVideo => ({
                        ...remoteVideo,
                        views: Math.max(remoteVideo.views || 0, localViewsMap.get(remoteVideo.id) || 0),
                    }));
                };
                remoteData.videos = mergeViews(remoteData.videos, localData.videos);
                remoteData.shorts = mergeViews(remoteData.shorts, localData.shorts);
              }
              
              const mergedDataRaw = JSON.stringify(remoteData);

              // Update state only if there's new data or it's the very first load
              if (mergedDataRaw !== localDataRaw || !initialDataLoaded) {
                  console.log("Applying new/updated data.");
                  setDataFromRemote(remoteData);
                  localStorage.setItem('janaKidsContent', mergedDataRaw);
              } else {
                  console.log("Fetched data is same as local cache. No update needed.");
              }
              initialDataLoaded = true;
          } catch (error) {
              console.error("Failed to fetch from Gist:", error);
              const errorMessage = (error as Error).message || 'فشل تحميل البيانات، تأكد من اتصالك بالانترنت وحاول تحديث الصفحة.';
              
              if (!initialDataLoaded) {
                  setLoadingError(errorMessage);
              } else {
                  setToastMessage({ text: 'فشل تحميل آخر التحديثات.', type: 'error' });
              }
          }
      } else {
          console.warn("GIST_RAW_URL is not set in App.tsx. Cannot load data.");
          if (!initialDataLoaded) {
            setLoadingError("مصدر بيانات الموقع غير محدد في الكود. يرجى مراجعة المطور.");
          }
      }
      
      setIsLoading(false);
    };

    loadInitialData();
  }, []);


  // Effect for syncing data to localStorage and Gist
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const contentToSync = {
        videos: baseVideos,
        shorts: baseShorts,
        activities,
        channelLogo,
        playlists,
        channelDescription,
        subscriptionUrl,
        adSettings,
    };

    // Always save the latest state to local cache for persistence immediately.
    localStorage.setItem('janaKidsContent', JSON.stringify(contentToSync));

    // Clear any pending Gist sync
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    // If not logged in as admin, stop here.
    if (!isLoggedIn || !GIST_RAW_URL || !syncSettings.githubToken) {
      return;
    }

    // Proceed with debounced Gist synchronization for admin
    syncTimerRef.current = window.setTimeout(async () => {
      setIsSyncing(true);
      try {
        const gistId = getGistId(GIST_RAW_URL);
        if (!gistId) {
          throw new Error("رابط Gist المحدد في الكود غير صالح. لا يمكن المزامنة.");
        }
        
        console.log(`Starting automatic sync for Gist ID: ${gistId}.`);

        const GIST_API_URL = `https://api.github.com/gists/${gistId}`;
        const AUTH_HEADERS = {
            'Authorization': `token ${syncSettings.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
        };
        
        const metaResponse = await fetch(GIST_API_URL, { headers: AUTH_HEADERS });
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
          headers: { ...AUTH_HEADERS, 'Content-Type': 'application/json' },
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
  }, [videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings, syncSettings, baseVideos, baseShorts, isLoggedIn, isLoading]);


  useEffect(() => {
    if(!isLoading) localStorage.setItem('janaKidsCredentials', JSON.stringify(credentials));
  }, [credentials, isLoading]);

  const handleConfigureAndSync = async (settings: GistSyncSettings) => {
    setIsSyncing(true);
    try {
        const gistId = getGistId(GIST_RAW_URL);
        if (!gistId) throw new Error("رابط Gist المحدد في الكود غير صالح. يرجى مراجعة ملف App.tsx");
        if (!settings.githubToken) throw new Error("رمز GitHub مطلوب للمزامنة.");

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
        
        setToastMessage({ text: 'تم ربط رمز المزامنة بنجاح!', type: 'success' });

    } catch (error) {
        setToastMessage({ text: (error as Error).message, type: 'error' });
        throw error;
    } finally {
        setIsSyncing(false);
    }
  };

  const handleExportData = () => {
    try {
        const dataToExport = {
            videos,
            shorts,
            activities,
            playlists,
            channelLogo,
            channelDescription,
            subscriptionUrl,
            adSettings,
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'jana_kids_data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setToastMessage({ text: 'تم تصدير البيانات بنجاح!', type: 'success' });
    } catch (error) {
        console.error("Failed to export data:", error);
        setToastMessage({ text: 'حدث خطأ أثناء تصدير البيانات.', type: 'error' });
    }
  };

  const handleImportData = (file: File) => {
    if (!window.confirm('هل أنت متأكد من استيراد البيانات الجديدة؟ سيتم الكتابة فوق جميع البيانات الحالية.')) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = event.target?.result;
            if (typeof result !== 'string') {
                throw new Error("تعذر قراءة الملف كنص.");
            }
            const importedData = JSON.parse(result);
            
            if (!importedData || typeof importedData !== 'object' || !Array.isArray(importedData.videos)) {
                 throw new Error("ملف JSON غير صالح أو لا يحتوي على البنية المتوقعة.");
            }

            setDataFromRemote(importedData);
            setToastMessage({ text: 'تم استيراد البيانات بنجاح!', type: 'success' });
        } catch (error) {
            console.error("Failed to import data:", error);
            setToastMessage({ text: (error as Error).message, type: 'error' });
        }
    };
    reader.onerror = () => {
        setToastMessage({ text: 'فشل قراءة الملف.', type: 'error' });
    };
    reader.readAsText(file, 'UTF-8');
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
    setBaseVideos(prev => [newVideo, ...prev]);
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
    setBaseShorts(prev => [newShort, ...prev]);
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
    const watchedVideosKey = 'janaKidsWatchedVideos';
    const watchedVideosRaw = localStorage.getItem(watchedVideosKey);
    const watchedVideos: number[] = watchedVideosRaw ? JSON.parse(watchedVideosRaw) : [];

    // Only count the view if this browser hasn't watched the video before.
    if (!watchedVideos.includes(videoId)) {
        watchedVideos.push(videoId);
        localStorage.setItem(watchedVideosKey, JSON.stringify(watchedVideos));

        // Send a request to the central counter. This is a "fire-and-forget" request.
        if (COUNTER_NAMESPACE) {
            fetch(`https://api.countapi.xyz/hit/${COUNTER_NAMESPACE}/item-${videoId}`)
              .catch(e => console.warn("Failed to log view count to central service", e));
        }
        
        // Update the local state immediately for instant UI feedback.
        const increment = (list: Video[]) => list.map(v => v.id === videoId ? { ...v, views: (v.views || 0) + 1 } : v);
        
        setVideos(prev => increment(prev));
        setShorts(prev => increment(prev));
        setBaseVideos(prev => increment(prev));
        setBaseShorts(prev => increment(prev));
    }
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
    setBaseVideos(prev => prev.filter(v => v.id !== videoId));
    setBaseShorts(prev => prev.filter(s => s.id !== videoId));
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
    setBaseVideos(updater);
    setBaseShorts(updater);
    setEditingVideo(null);
  };

  const handleToggleNotifications = () => {
      setShowNotificationsPanel(prev => !prev);
      if (!showNotificationsPanel && newVideoIds.length > 0) {
          const allCurrentVideoIds = videos.map(v => v.id);
          localStorage.setItem('janaKidsSeenVideos', JSON.stringify(allCurrentVideoIds));
          setNewVideoIds([]);
      }
  };

  const handleToggleAdsPanel = () => {
    setShowAdsPanel(prev => !prev);
  };

  const handleAdSettingsChange = (newSettings: AdSettings) => {
    setAdSettings(newSettings);
  };

  const videosToDisplay = (selectedPlaylistId === 'all' 
    ? videos 
    : videos.filter(v => playlists.find(p => p.id === selectedPlaylistId)?.videoIds.includes(v.id))
  ).filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newVideosList = videos.filter(v => newVideoIds.includes(v.id));

  const validAds = adSettings.ads.filter(ad => ad.imageUrl);


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 p-8 text-center">
        <svg className="animate-spin h-16 w-16 text-sky-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h1 className="text-4xl font-black text-sky-700 mb-4">
            جاري تحضير عالم جنى الممتع!
        </h1>
        <p className="text-lg text-gray-600 max-w-xl">
            لحظات قليلة وستظهر أحدث الفيديوهات والأنشطة. في زيارتك الأولى، قد يستغرق الأمر وقتاً أطول قليلاً لجلب كل شيء. شكراً لصبرك الجميل!
        </p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-8">
          <div className="text-center max-w-2xl bg-white p-10 rounded-2xl shadow-2xl border-2 border-red-200">
              <h1 className="text-4xl font-black mb-4">⚠️ حدث خطأ</h1>
              <p className="text-lg mb-6">
                  {loadingError}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition-colors duration-300 shadow-lg text-lg"
              >
                إعادة المحاولة
              </button>
          </div>
      </div>
    );
  }

  if (!GIST_RAW_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-8">
          <div className="text-center max-w-2xl bg-white p-10 rounded-2xl shadow-2xl border-2 border-red-200">
              <h1 className="text-4xl font-black mb-4">⚠️ خطوة مهمة مطلوبة</h1>
              <p className="text-lg mb-6">
                  مصدر بيانات الموقع غير محدد. لكي يعمل الموقع، يجب على المطور تعديل ملف <code className="bg-red-100 p-1 rounded-md text-base font-mono">App.tsx</code> وإضافة رابط البيانات الخام (Raw URL) الخاص بملف Gist.
              </p>
              <p className="text-gray-600">
                  الرجاء مراجعة التعليمات الموجودة في أعلى الملف.
              </p>
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
        <div className="my-8 flex justify-between items-center gap-4 relative">
            <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
             <div className="flex items-center flex-shrink-0">
                <AdIcon count={validAds.length} onClick={handleToggleAdsPanel} />
                <NotificationBell count={newVideoIds.length} onClick={handleToggleNotifications} />
            </div>
            {showAdsPanel && (
                <AdsPanel
                    ads={validAds}
                    onClose={() => setShowAdsPanel(false)}
                />
            )}
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
                        onExportData={handleExportData}
                        onImportData={handleImportData}
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
            <div className="col-span-full text-center py-16 bg-white/50 rounded-3xl shadow-inner border-2 border-dashed border-sky-200">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-3xl font-bold text-sky-700 mb-2">
                  {searchQuery ? `لا توجد نتائج بحث` : 'مكتبة الفيديو فارغة حالياً'}
                </h3>
                <p className="text-lg text-gray-600 max-w-xl mx-auto">
                    {searchQuery 
                        ? `لم نتمكن من العثور على أي فيديو يطابق "${searchQuery}".` 
                        : (isLoggedIn 
                            ? 'رائع! لنبدأ بإضافة أول فيديو لك من لوحة تحكم الأدمن في الأعلى.' 
                            : 'مرحباً بك في قناة جنى! نحن نجهز لكم فيديوهات جديدة وممتعة. عودوا لزيارتنا قريباً!')
                    }
                </p>
            </div>
          )}
        </div>
      </main>

      {adSettings.ctaEnabled && <AdvertiserCta settings={adSettings} />}
      
      <Footer />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      {isLoggedIn && <SyncIndicator isSyncing={isSyncing} />}
    </div>
  );
};

export default App;
