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
import LoadingScreen from './components/LoadingScreen';
import FeedbackIcon from './components/FeedbackIcon';
import FeedbackPanel from './components/FeedbackPanel';
import type { Video, Playlist, Activity, AdSettings, Ad, Feedback } from './types';


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
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  // App Control State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | 'all'>('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [timeoutMessage, setTimeoutMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newVideoIds, setNewVideoIds] = useState<number[]>([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [showAdsPanel, setShowAdsPanel] = useState(false);
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false);
  const contentReadyRef = useRef(false);
  const startupTimeout = useRef(false);

  // Settings State
  const [credentials, setCredentials] = useState({ username: "admin", password: "password" });
  const [syncSettings, setSyncSettings] = useState<GistSyncSettings>({ githubToken: '' });

  const syncTimerRef = useRef<number | null>(null);
  const liveViewsFetchedRef = useRef(false);

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
    setFeedback(data.feedback ?? []);

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
      setLoadingError(null);

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
      const localDataRaw = localStorage.getItem('janaKidsContent');
      let localData: any = null;
      
      // 1. Attempt to load from localStorage for an instant UI
      if (localDataRaw) {
          try {
              console.log("Applying data from localStorage cache for instant UI.");
              localData = JSON.parse(localDataRaw);
              setDataFromRemote(localData);
              contentReadyRef.current = true;
          } catch (e) {
              console.error("Corrupt local data, removing.", e);
              localStorage.removeItem('janaKidsContent');
          }
      }

      // 2. Always fetch from the network to get the latest version.
      if (GIST_RAW_URL) {
          if (contentReadyRef.current) setIsSyncing(true);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20-second timeout

          try {
              const response = await fetch(`${GIST_RAW_URL}?v=${new Date().getTime()}`, { signal: controller.signal });
              clearTimeout(timeoutId);

              if (!response.ok) throw new Error(`فشل الاتصال بالخادم (Status: ${response.status})`);
              
              const remoteData = await response.json();

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

              // Update state and local storage with fresh data
              setDataFromRemote(remoteData);
              localStorage.setItem('janaKidsContent', mergedDataRaw);
              contentReadyRef.current = true;

          } catch (error) {
              clearTimeout(timeoutId);
              console.error("Failed to fetch from Gist:", error);
              
              if ((error as Error).name === 'AbortError') {
                  startupTimeout.current = true;
                  setTimeoutMessage('يبدو أن الاتصال بالإنترنت بطيء قليلاً، نرجو الانتظار للحظات...');
              } else {
                  const errorMessage = (error as Error).message || 'فشل تحميل البيانات، تأكد من اتصالك بالانترنت وحاول تحديث الصفحة.';
                  if (!contentReadyRef.current) {
                      setLoadingError(errorMessage);
                  } else {
                      setToastMessage({ text: 'فشل تحميل آخر التحديثات.', type: 'error' });
                  }
              }
          } finally {
              setIsSyncing(false);
              if (!startupTimeout.current) {
                  setIsInitialLoad(false);
              }
          }
      } else {
          console.warn("GIST_RAW_URL is not set in App.tsx. Cannot load data.");
          if (!contentReadyRef.current) {
            setLoadingError("مصدر بيانات الموقع غير محدد في الكود. يرجى مراجعة المطور.");
          }
          setIsInitialLoad(false);
      }
    };

    loadInitialData();
  }, []);

  // Effect for fetching live view counts in the background AFTER initial render
  useEffect(() => {
    // This effect should only run once after the initial data is loaded.
    if (isInitialLoad || liveViewsFetchedRef.current) {
      return;
    }
    
    liveViewsFetchedRef.current = true;

    const fetchLiveViewCounts = async () => {
        if (!COUNTER_NAMESPACE || (baseVideos.length === 0 && baseShorts.length === 0)) {
            return;
        }

        console.log("Starting background fetch for live view counts...");

        const fetchCounts = async (items: Video[]) => {
            if (!items || items.length === 0) return items;
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

        try {
            // Fetch based on current state.
            const [newlyFetchedVideos, newlyFetchedShorts] = await Promise.all([
                fetchCounts(baseVideos),
                fetchCounts(baseShorts)
            ]);
            
            console.log("Live view counts fetched. Updating state, which will trigger main sync effect.");

            // Update the base data. This will trigger the sync effect.
            setBaseVideos(newlyFetchedVideos);
            setBaseShorts(newlyFetchedShorts);

            // Re-apply search/filter to the derived display state.
            if (searchQuery) {
                 const lowerCaseQuery = searchQuery.toLowerCase();
                 const filtered = newlyFetchedVideos.filter(video => 
                   video.title.toLowerCase().includes(lowerCaseQuery)
                 );
                 setVideos(filtered);
            } else {
                 setVideos(newlyFetchedVideos);
            }
            setShorts(newlyFetchedShorts);

        } catch (e) {
            console.warn("Background fetch for live view counts failed.", e);
        }
    };
    
    // Delay this slightly to not interfere with initial paint
    setTimeout(fetchLiveViewCounts, 1000);

  }, [isInitialLoad, baseVideos, baseShorts, searchQuery]);


  // Effect for syncing data to localStorage and Gist
  useEffect(() => {
    if (isInitialLoad) {
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
        feedback,
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
  }, [videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings, feedback, syncSettings, baseVideos, baseShorts, isLoggedIn, isInitialLoad]);


  useEffect(() => {
    if(!isInitialLoad) localStorage.setItem('janaKidsCredentials', JSON.stringify(credentials));
  }, [credentials, isInitialLoad]);

  const handleConfigureAndSync = async (settings: GistSyncSettings) => {
    setIsSyncing(true);
    try {
        const gistId = getGistId(GIST_RAW_URL);
        if (!gistId) throw new Error("رابط Gist المحدد في الكود غير صالح. يرجى مراجعة ملف App.tsx");
        if (!settings.githubToken) throw new Error("رمز GitHub مطلوب للمزامنة.");

        const contentToSync = {
            videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings, feedback,
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
            feedback,
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
  
  const handleIncrementViewCount = async (videoId: number) => {
    // Always perform an optimistic UI update for immediate feedback.
    // This makes the counter feel responsive to the user on every click.
    const optimisticIncrement = (list: Video[]) =>
        list.map(v => v.id === videoId ? { ...v, views: (v.views || 0) + 1 } : v);
    
    setVideos(prev => optimisticIncrement(prev));
    setShorts(prev => optimisticIncrement(prev));
    setBaseVideos(prev => optimisticIncrement(prev));
    setBaseShorts(prev => optimisticIncrement(prev));

    // Now, check if this is a "real" new view that should be persisted and synced globally.
    const watchedVideosKey = 'janaKidsWatchedVideos';
    const watchedVideosRaw = localStorage.getItem(watchedVideosKey);
    const watchedVideos: number[] = watchedVideosRaw ? JSON.parse(watchedVideosRaw) : [];

    // Only sync with the central counter if this browser hasn't watched the video before.
    if (!watchedVideos.includes(videoId)) {
        watchedVideos.push(videoId);
        localStorage.setItem(watchedVideosKey, JSON.stringify(watchedVideos));
        
        if (COUNTER_NAMESPACE) {
            try {
                // Increment the central counter and get the new authoritative value.
                const hitResponse = await fetch(`https://api.countapi.xyz/hit/${COUNTER_NAMESPACE}/item-${videoId}`);
                if (!hitResponse.ok) {
                    throw new Error('Count API "hit" request failed');
                }
                
                const data = await hitResponse.json();
                const newTotalViews = data.value;

                if (typeof newTotalViews === 'number') {
                    // Sync our UI with the authoritative count from the API.
                    // This corrects the local optimistic update with the true global count.
                    const updateStateWithApiCount = (list: Video[]) =>
                        list.map(v => v.id === videoId ? { ...v, views: newTotalViews } : v);
                    
                    setVideos(prev => updateStateWithApiCount(prev));
                    setShorts(prev => updateStateWithApiCount(prev));
                    setBaseVideos(prev => updateStateWithApiCount(prev));
                    setBaseShorts(prev => updateStateWithApiCount(prev));
                } else {
                    throw new Error('Invalid Count API "hit" response, value is not a number');
                }
            } catch (e) {
                console.warn("Failed to sync view count with API. The local optimistic update remains for this session.", e);
                // On failure, the optimistic update remains.
            }
        }
    }
  };

  const handleCloseNotifications = () => {
    setShowNotificationsPanel(false);
    if (newVideoIds.length > 0) {
        const seenVideosRaw = localStorage.getItem('janaKidsSeenVideos');
        const seenVideoIds: number[] = seenVideosRaw ? JSON.parse(seenVideosRaw) : [];
        const allCurrentVideoIds = videos.map(v => v.id);
        const updatedSeenIds = [...new Set([...seenVideoIds, ...allCurrentVideoIds])];
        localStorage.setItem('janaKidsSeenVideos', JSON.stringify(updatedSeenIds));
        setNewVideoIds([]);
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

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleDeleteVideo = (videoId: number) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    setBaseVideos(prev => prev.filter(v => v.id !== videoId));
    setShorts(prev => prev.filter(v => v.id !== videoId));
    setBaseShorts(prev => prev.filter(v => v.id !== videoId));
    setPlaylists(prev => prev.map(p => ({
        ...p,
        videoIds: p.videoIds.filter(id => id !== videoId)
    })));
  };

  const handleEditVideo = (video: { id: number; title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(video.youtubeUrl);
    if (!videoId) {
      alert('رابط يوتيوب غير صالح.');
      return;
    }
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    const updateInList = (list: Video[]) => list.map(v => v.id === video.id ? { ...v, ...video, thumbnailUrl } : v);

    setVideos(prev => updateInList(prev));
    setBaseVideos(prev => updateInList(prev));
    setShorts(prev => updateInList(prev));
    setBaseShorts(prev => updateInList(prev));

    setEditingVideo(null);
  };
  
  const handleDeleteActivity = (activityId: number) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query === '') {
      setVideos(baseVideos);
      return;
    }
    const lowerCaseQuery = query.toLowerCase();
    const filtered = baseVideos.filter(video => 
      video.title.toLowerCase().includes(lowerCaseQuery)
    );
    setVideos(filtered);
  };

  const handleAddFeedback = (rating: number, comment: string) => {
    const newFeedback: Feedback = {
        id: Date.now(),
        rating,
        comment,
        createdAt: new Date().toISOString(),
    };
    setFeedback(prev => [newFeedback, ...prev]);
    setToastMessage({ text: 'شكراً لمشاركتنا رأيك!', type: 'success' });
    setShowFeedbackPanel(true);
  };

  const handleDeleteFeedback = (feedbackId: number) => {
      setFeedback(prev => prev.filter(f => f.id !== feedbackId));
  };


  const filteredVideos = selectedPlaylistId === 'all'
    ? videos
    : videos.filter(v => playlists.find(p => p.id === selectedPlaylistId)?.videoIds.includes(v.id));

  if (isInitialLoad && !contentReadyRef.current) {
    return <LoadingScreen timeoutMessage={timeoutMessage} />;
  }

  if (loadingError) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center p-4">
            <h2 className="text-3xl font-bold text-red-600 mb-4">حدث خطأ</h2>
            <p className="text-lg text-red-800 bg-red-100 p-4 rounded-lg">{loadingError}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 bg-red-500 text-white font-bold py-2 px-6 rounded-full hover:bg-red-600 transition-colors"
            >
                إعادة تحميل الصفحة
            </button>
        </div>
    );
  }

  return (
    <div className="App">
      <Header
        logo={channelLogo}
        onLogoUpload={handleLogoUpload}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
        channelDescription={channelDescription}
        onDescriptionChange={setChannelDescription}
        videoCount={baseVideos.length}
        subscriptionUrl={subscriptionUrl}
        onAddFeedback={handleAddFeedback}
      />

      <main className="container mx-auto p-4 md:p-8">
        <div className="flex items-center mb-8 relative">
            <SearchBar query={searchQuery} onQueryChange={handleSearchChange} />
            <NotificationBell count={newVideoIds.length} onClick={() => setShowNotificationsPanel(p => !p)} />
            {showNotificationsPanel && (
                <NotificationPanel newVideos={videos.filter(v => newVideoIds.includes(v.id))} onClose={handleCloseNotifications} />
            )}
            {adSettings.ads.length > 0 && (
                <div className="ml-2 relative">
                    <AdIcon count={adSettings.ads.length} onClick={() => setShowAdsPanel(p => !p)} />
                    {showAdsPanel && <AdsPanel ads={adSettings.ads} onClose={() => setShowAdsPanel(false)} />}
                </div>
            )}
            <div className="ml-2 relative">
                <FeedbackIcon count={feedback.length} onClick={() => setShowFeedbackPanel(p => !p)} />
                {showFeedbackPanel && <FeedbackPanel feedback={feedback} onClose={() => setShowFeedbackPanel(false)} />}
            </div>
        </div>

        {isLoggedIn && (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
                <AddVideoForm onAddVideo={handleAddVideo} />
                <CreatePlaylistForm onCreatePlaylist={handleCreatePlaylist} />
                <AddShortsForm onAddShort={handleAddShort} />
                <AddActivityForm onAddActivity={handleAddActivity} />
                <div className="md:col-span-2">
                    <AdminSettings 
                        onCredentialsChange={setCredentials} 
                        currentCredentials={credentials}
                        onSubscriptionUrlChange={setSubscriptionUrl}
                        currentSubscriptionUrl={subscriptionUrl}
                        onConfigureAndSync={handleConfigureAndSync}
                        currentSyncSettings={syncSettings}
                        onAdSettingsChange={setAdSettings}
                        currentAdSettings={adSettings}
                        onExportData={handleExportData}
                        onImportData={handleImportData}
                        currentFeedback={feedback}
                        onDeleteFeedback={handleDeleteFeedback}
                    />
                </div>
            </div>
        )}
        
        {shorts.length > 0 && (
            <ShortsCarousel shorts={shorts} onWatchNowClick={handleIncrementViewCount} />
        )}

        <PlaylistTabs playlists={playlists} selectedId={selectedPlaylistId} onSelect={setSelectedPlaylistId} />

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                isAdmin={isLoggedIn}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
                onDeleteVideo={handleDeleteVideo}
                onEditVideo={(v) => setEditingVideo(v)}
                onWatchNowClick={handleIncrementViewCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 rounded-2xl">
            <h3 className="text-2xl font-bold text-sky-800">لا توجد فيديوهات هنا بعد</h3>
            <p className="text-gray-600 mt-2">
                {searchQuery ? `لم يتم العثور على نتائج للبحث عن "${searchQuery}".` : 'جرب اختيار قائمة تشغيل أخرى أو أضف فيديوهات جديدة!'}
            </p>
          </div>
        )}

        {activities.length > 0 && (
            <div className="mt-16">
                 <h2 className="text-3xl font-bold text-gray-800 mb-6 border-r-8 border-green-500 pr-4">
                    أنشطة وأوراق عمل
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
                </div>
            </div>
        )}
      </main>
      
      {adSettings.ctaEnabled && <AdvertiserCta settings={adSettings} />}

      <Footer />
      
      {showLoginModal && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {editingVideo && (
        <EditVideoModal 
            video={editingVideo}
            onUpdate={handleEditVideo}
            onClose={() => setEditingVideo(null)}
        />
      )}

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      <SyncIndicator isSyncing={isSyncing} />
    </div>
  );
};

export default App;