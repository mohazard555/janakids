
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

interface FeedbackSyncSettings {
    url: string;
    token: string;
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
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
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
  const [feedbackSyncSettings, setFeedbackSyncSettings] = useState<FeedbackSyncSettings>({ url: '', token: '' });

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
    setFeedback(data.feedback ?? []); // Set feedback from main gist as a backup
    setFeedbackSyncSettings(data.feedbackSyncSettings ?? { url: '', token: '' });


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

      if (GIST_RAW_URL) {
          if (contentReadyRef.current) setIsSyncing(true);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);

          try {
              const response = await fetch(`${GIST_RAW_URL}?v=${new Date().getTime()}`, { signal: controller.signal });
              clearTimeout(timeoutId);

              if (!response.ok) throw new Error(`فشل الاتصال بالخادم (Status: ${response.status})`);
              
              const remoteData = await response.json();

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
              
              localStorage.setItem('janaKidsContent', JSON.stringify(remoteData));
              setDataFromRemote(remoteData);
              contentReadyRef.current = true;
              
              // --- Fetch Live Feedback ---
              const liveFeedbackSettings = remoteData.feedbackSyncSettings || { url: '' };
              if (liveFeedbackSettings.url) {
                  try {
                      console.log("Fetching live feedback from:", liveFeedbackSettings.url);
                      const feedbackGistId = getGistId(liveFeedbackSettings.url);
                      if (!feedbackGistId) throw new Error("Invalid feedback Gist URL.");

                      const mainGistUser = GIST_RAW_URL.split('/')[3];
                      const feedbackRawUrl = `https://gist.githubusercontent.com/${mainGistUser}/${feedbackGistId}/raw`;

                      const feedbackResponse = await fetch(`${feedbackRawUrl}?v=${new Date().getTime()}`);
                      if (!feedbackResponse.ok) throw new Error(`Could not fetch feedback Gist (${feedbackResponse.status})`);
                      
                      const liveFeedback = await feedbackResponse.json();
                      if (Array.isArray(liveFeedback)) {
                          setFeedback(liveFeedback);
                          console.log("Successfully loaded live feedback.");
                      }
                  } catch (e) {
                      console.warn("Failed to load live feedback, using backup from main Gist.", e);
                      setToastMessage({ text: 'فشل تحميل الآراء المباشرة.', type: 'error' });
                  }
              }


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

  useEffect(() => {
    if (isInitialLoad || liveViewsFetchedRef.current) return;
    liveViewsFetchedRef.current = true;

    const fetchLiveViewCounts = async () => {
        if (!COUNTER_NAMESPACE || (baseVideos.length === 0 && baseShorts.length === 0)) return;
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
            return items.map(item => ({ ...item, views: Math.max(item.views || 0, viewsMap.get(item.id) || 0) }));
        };
        try {
            const [newlyFetchedVideos, newlyFetchedShorts] = await Promise.all([ fetchCounts(baseVideos), fetchCounts(baseShorts) ]);
            console.log("Live view counts fetched. Updating state.");
            setBaseVideos(newlyFetchedVideos);
            setBaseShorts(newlyFetchedShorts);
            if (searchQuery) {
                 const lowerCaseQuery = searchQuery.toLowerCase();
                 const filtered = newlyFetchedVideos.filter(video => video.title.toLowerCase().includes(lowerCaseQuery) );
                 setVideos(filtered);
            } else {
                 setVideos(newlyFetchedVideos);
            }
            setShorts(newlyFetchedShorts);
        } catch (e) {
            console.warn("Background fetch for live view counts failed.", e);
        }
    };
    setTimeout(fetchLiveViewCounts, 1000);
  }, [isInitialLoad, baseVideos, baseShorts, searchQuery]);

  useEffect(() => {
    if (isInitialLoad) return;
    const contentToSync = {
        videos: baseVideos, shorts: baseShorts, activities, channelLogo, playlists,
        channelDescription, subscriptionUrl, adSettings, 
        feedback: feedback, // Keep a backup in the main gist
        feedbackSyncSettings, // Save the settings for live feedback
    };
    localStorage.setItem('janaKidsContent', JSON.stringify(contentToSync));
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    if (!isLoggedIn || !GIST_RAW_URL || !syncSettings.githubToken) return;
    syncTimerRef.current = window.setTimeout(async () => {
      setIsSyncing(true);
      try {
        const gistId = getGistId(GIST_RAW_URL);
        if (!gistId) throw new Error("رابط Gist المحدد في الكود غير صالح.");
        console.log(`Starting automatic sync for Gist ID: ${gistId}.`);
        const GIST_API_URL = `https://api.github.com/gists/${gistId}`;
        const AUTH_HEADERS = { 'Authorization': `token ${syncSettings.githubToken}`, 'Accept': 'application/vnd.github.v3+json' };
        const metaResponse = await fetch(GIST_API_URL, { headers: AUTH_HEADERS });
        if (!metaResponse.ok) throw new Error(`فشل جلب Gist: Status ${metaResponse.status}`);
        const gistData = await metaResponse.json();
        const filesToPatch: { [key: string]: any } = { [CANONICAL_FILENAME]: { content: JSON.stringify(contentToSync, null, 2) } };
        Object.keys(gistData.files).forEach(filename => { if (filename !== CANONICAL_FILENAME) filesToPatch[filename] = null; });
        const patchResponse = await fetch(GIST_API_URL, { method: 'PATCH', headers: { ...AUTH_HEADERS, 'Content-Type': 'application/json' }, body: JSON.stringify({ description: "Jana Kids Channel Data", files: filesToPatch }) });
        if (!patchResponse.ok) { const errorData = await patchResponse.json().catch(() => ({})); throw new Error(`فشل الحفظ: ${errorData.message || `Status ${patchResponse.status}`}`); }
        console.log("Gist sync completed successfully.");
        setToastMessage({ text: 'تمت المزامنة بنجاح!', type: 'success' });
      } catch (error) {
        console.error("Failed to sync data to Gist:", error);
        setToastMessage({ text: (error as Error).message, type: 'error' });
      } finally {
        setIsSyncing(false);
      }
    }, 2000);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings, feedback, syncSettings, feedbackSyncSettings, baseVideos, baseShorts, isLoggedIn, isInitialLoad]);

  useEffect(() => {
    if(!isInitialLoad) localStorage.setItem('janaKidsCredentials', JSON.stringify(credentials));
  }, [credentials, isInitialLoad]);

  const handleConfigureAndSync = async (settings: GistSyncSettings) => {
    setIsSyncing(true);
    try {
        const gistId = getGistId(GIST_RAW_URL);
        if (!gistId) throw new Error("رابط Gist المحدد في الكود غير صالح.");
        if (!settings.githubToken) throw new Error("رمز GitHub مطلوب.");
        const contentToSync = { videos, shorts, activities, channelLogo, playlists, channelDescription, subscriptionUrl, adSettings, feedback, feedbackSyncSettings };
        const GIST_API_URL = `https://api.github.com/gists/${gistId}`;
        const AUTH_HEADERS = { 'Authorization': `token ${settings.githubToken}`, 'Accept': 'application/vnd.github.v3+json' };
        await fetch(GIST_API_URL, { headers: AUTH_HEADERS }).then(res => { if (!res.ok) throw new Error(`فشل الاتصال بـ Gist (Status: ${res.status})`) });
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

  // FIX: Implemented all placeholder handler functions to provide full application functionality.
  const handleExportData = () => {
    const dataToExport = {
      videos: baseVideos, shorts: baseShorts, activities, channelLogo, playlists,
      channelDescription, subscriptionUrl, adSettings, feedback, feedbackSyncSettings,
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jana_kids_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage({ text: 'تم تصدير البيانات بنجاح!', type: 'success' });
  };
  const handleImportData = (file: File) => {
    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File content is not text.");
                }
                const importedData = JSON.parse(text);
                if (Array.isArray(importedData.videos)) {
                    setDataFromRemote(importedData);
                    setToastMessage({ text: 'تم استيراد البيانات بنجاح!', type: 'success' });
                } else {
                    throw new Error("Invalid data structure in JSON file.");
                }
            } catch (error) {
                console.error("Failed to import data:", error);
                setToastMessage({ text: `فشل استيراد البيانات: ${(error as Error).message}`, type: 'error' });
            }
        };
        reader.readAsText(file);
    } else {
        setToastMessage({ text: 'الرجاء اختيار ملف JSON صالح.', type: 'error' });
    }
  };
  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setChannelLogo(reader.result as string);
      setToastMessage({ text: 'تم تحديث الشعار بنجاح!', type: 'success' });
    };
    reader.readAsDataURL(file);
  };
  const handleAddVideo = (data: { title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(data.youtubeUrl);
    if (!videoId) {
        setToastMessage({ text: 'رابط يوتيوب غير صالح.', type: 'error' });
        return;
    }
    const newVideo: Video = {
      id: Date.now(),
      title: data.title,
      youtubeUrl: data.youtubeUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      views: 0
    };
    setBaseVideos(prev => [newVideo, ...prev]);
    setToastMessage({ text: 'تمت إضافة الفيديو بنجاح!', type: 'success' });
  };
  const handleAddShort = (data: { title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(data.youtubeUrl);
    if (!videoId) {
        setToastMessage({ text: 'رابط يوتيوب غير صالح.', type: 'error' });
        return;
    }
     const newShort: Video = {
      id: Date.now(),
      title: data.title,
      youtubeUrl: data.youtubeUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      views: 0
    };
    setBaseShorts(prev => [newShort, ...prev]);
    setToastMessage({ text: 'تمت إضافة الشورت بنجاح!', type: 'success' });
  };
  const handleAddActivity = (data: { title: string; description: string; imageFile: File }) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newActivity: Activity = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        imageUrl: reader.result as string
      };
      setActivities(prev => [newActivity, ...prev]);
      setToastMessage({ text: 'تمت إضافة النشاط بنجاح!', type: 'success' });
    };
    reader.readAsDataURL(data.imageFile);
  };
  const handleIncrementViewCount = async (videoId: number) => {
    if (!COUNTER_NAMESPACE) return;
    try {
        await fetch(`https://api.countapi.xyz/hit/${COUNTER_NAMESPACE}/item-${videoId}`);
        const incrementLocal = (list: Video[]) => list.map(v => v.id === videoId ? { ...v, views: (v.views || 0) + 1 } : v);
        setBaseVideos(incrementLocal);
        setBaseShorts(incrementLocal);
    } catch (e) {
        console.warn("Could not increment view count.", e);
    }
  };
  const handleCloseNotifications = () => {
    setShowNotificationsPanel(false);
    const allVideoIds = [...baseVideos, ...baseShorts].map(v => v.id);
    localStorage.setItem('janaKidsSeenVideos', JSON.stringify(allVideoIds));
    setNewVideoIds([]);
  };
  const handleCreatePlaylist = (name: string) => {
    if (playlists.some(p => p.name === name)) {
        setToastMessage({ text: 'قائمة التشغيل بهذا الاسم موجودة بالفعل.', type: 'error' });
        return;
    }
    const newPlaylist: Playlist = {
      id: Date.now(),
      name,
      videoIds: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    setToastMessage({ text: 'تم إنشاء قائمة التشغيل بنجاح!', type: 'success' });
  };
  const handleAddToPlaylist = (videoId: number, playlistId: number) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist?.videoIds.includes(videoId)) {
        setToastMessage({ text: 'الفيديو موجود بالفعل في هذه القائمة.', type: 'error' });
        return;
    }
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId ? { ...p, videoIds: [...p.videoIds, videoId] } : p
    ));
  };
  const handleLogin = (user: string, pass: string): boolean => {
    if (user === credentials.username && pass === credentials.password) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setToastMessage({ text: 'تم تسجيل الدخول بنجاح!', type: 'success' });
      return true;
    }
    return false;
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setToastMessage({ text: 'تم تسجيل الخروج.', type: 'success' });
  };
  const handleDeleteVideo = (videoId: number) => {
    setBaseVideos(prev => prev.filter(v => v.id !== videoId));
    setBaseShorts(prev => prev.filter(s => s.id !== videoId));
    setPlaylists(prev => prev.map(p => ({ ...p, videoIds: p.videoIds.filter(id => id !== videoId) })));
    setToastMessage({ text: 'تم حذف الفيديو بنجاح!', type: 'success' });
  };
  const handleEditVideo = (video: { id: number; title: string; youtubeUrl: string }) => {
    const videoId = getYoutubeVideoId(video.youtubeUrl);
    if (!videoId) {
        setToastMessage({ text: 'رابط يوتيوب غير صالح.', type: 'error' });
        return;
    }
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    const updateList = (list: Video[]) => list.map(v => v.id === video.id ? { ...v, title: video.title, youtubeUrl: video.youtubeUrl, thumbnailUrl } : v);

    setBaseVideos(updateList);
    setBaseShorts(updateList);
    setEditingVideo(null);
    setToastMessage({ text: 'تم تحديث الفيديو بنجاح!', type: 'success' });
  };
  const handleDeleteActivity = (activityId: number) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
    setToastMessage({ text: 'تم حذف النشاط بنجاح!', type: 'success' });
  };
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const lowerCaseQuery = query.toLowerCase();
    if (query.trim() === '') {
      setVideos(baseVideos);
    } else {
      const filtered = baseVideos.filter(video =>
        video.title.toLowerCase().includes(lowerCaseQuery)
      );
      setVideos(filtered);
    }
  };

  const updateLiveFeedbackGist = async (newFeedbackArray: Feedback[]) => {
      const { url, token } = feedbackSyncSettings;
      if (!url || !token) throw new Error("إعدادات مزامنة الآراء غير مكتملة.");
      const gistId = getGistId(url);
      if (!gistId) throw new Error("رابط Gist للآراء غير صالح.");
      const GIST_API_URL = `https://api.github.com/gists/${gistId}`;
      const AUTH_HEADERS = { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' };
      
      const getResponse = await fetch(GIST_API_URL, { headers: AUTH_HEADERS });
      if (!getResponse.ok) throw new Error("فشل الوصول لبيانات الآراء.");
      const gistData = await getResponse.json();
      const filename = Object.keys(gistData.files)[0];
      if (!filename) throw new Error("لم يتم العثور على ملف في Gist الآراء.");

      const patchResponse = await fetch(GIST_API_URL, {
          method: 'PATCH',
          headers: { ...AUTH_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({
              files: { [filename]: { content: JSON.stringify(newFeedbackArray, null, 2) } },
          }),
      });
      if (!patchResponse.ok) throw new Error("فشل تحديث بيانات الآراء.");
  };

  const handleAddFeedback = async (rating: number, comment: string) => {
    if (!feedbackSyncSettings.url || !feedbackSyncSettings.token) {
        setToastMessage({ text: 'ميزة الآراء المباشرة غير مفعلة من قبل الأدمن.', type: 'error' });
        return;
    }
    setIsSubmittingFeedback(true);
    setToastMessage({ text: 'جاري إرسال رأيك...', type: 'success' });
    try {
        const newFeedbackItem: Feedback = { id: Date.now(), rating, comment, createdAt: new Date().toISOString() };
        const updatedFeedback = [newFeedbackItem, ...feedback];
        await updateLiveFeedbackGist(updatedFeedback);
        setFeedback(updatedFeedback);
        setToastMessage({ text: 'شكراً لمشاركتنا رأيك!', type: 'success' });
        setShowFeedbackPanel(true);
    } catch (error) {
        console.error("Failed to submit feedback:", error);
        setToastMessage({ text: (error as Error).message, type: 'error' });
    } finally {
        setIsSubmittingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
      setIsSyncing(true);
      try {
          const updatedFeedback = feedback.filter(f => f.id !== feedbackId);
          await updateLiveFeedbackGist(updatedFeedback);
          setFeedback(updatedFeedback);
          setToastMessage({ text: 'تم حذف الرأي بنجاح.', type: 'success' });
      } catch (error) {
          console.error("Failed to delete feedback:", error);
          setToastMessage({ text: (error as Error).message, type: 'error' });
      } finally {
          setIsSyncing(false);
      }
  };

  const filteredVideos = selectedPlaylistId === 'all'
    ? videos
    : videos.filter(v => playlists.find(p => p.id === selectedPlaylistId)?.videoIds.includes(v.id));

  if (isInitialLoad && !contentReadyRef.current) return <LoadingScreen timeoutMessage={timeoutMessage} />;
  if (loadingError) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center p-4">
            <h2 className="text-3xl font-bold text-red-600 mb-4">حدث خطأ</h2>
            <p className="text-lg text-red-800 bg-red-100 p-4 rounded-lg">{loadingError}</p>
            <button onClick={() => window.location.reload()} className="mt-6 bg-red-500 text-white font-bold py-2 px-6 rounded-full hover:bg-red-600 transition-colors">إعادة تحميل الصفحة</button>
        </div>
    );

  return (
    <div className="App">
      <Header
        logo={channelLogo} onLogoUpload={handleLogoUpload} isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLoginModal(true)} onLogoutClick={handleLogout}
        channelDescription={channelDescription} onDescriptionChange={setChannelDescription}
        videoCount={baseVideos.length} subscriptionUrl={subscriptionUrl}
        onAddFeedback={handleAddFeedback} isSubmittingFeedback={isSubmittingFeedback}
      />

      <main className="container mx-auto p-4 md:p-8">
        <div className="flex items-center mb-8 relative">
            <SearchBar query={searchQuery} onQueryChange={handleSearchChange} />
            <NotificationBell count={newVideoIds.length} onClick={() => setShowNotificationsPanel(p => !p)} />
            {showNotificationsPanel && <NotificationPanel newVideos={videos.filter(v => newVideoIds.includes(v.id))} onClose={handleCloseNotifications} />}
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
                        onCredentialsChange={setCredentials} currentCredentials={credentials}
                        onSubscriptionUrlChange={setSubscriptionUrl} currentSubscriptionUrl={subscriptionUrl}
                        onConfigureAndSync={handleConfigureAndSync} currentSyncSettings={syncSettings}
                        onAdSettingsChange={setAdSettings} currentAdSettings={adSettings}
                        onExportData={handleExportData} onImportData={handleImportData}
                        currentFeedback={feedback} onDeleteFeedback={handleDeleteFeedback}
                        onFeedbackSyncSettingsChange={setFeedbackSyncSettings} currentFeedbackSyncSettings={feedbackSyncSettings}
                    />
                </div>
            </div>
        )}
        
        {shorts.length > 0 && <ShortsCarousel shorts={shorts} onWatchNowClick={handleIncrementViewCount} />}
        <PlaylistTabs playlists={playlists} selectedId={selectedPlaylistId} onSelect={setSelectedPlaylistId} />

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} isAdmin={isLoggedIn} playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist} onDeleteVideo={handleDeleteVideo}
                onEditVideo={(v) => setEditingVideo(v)} onWatchNowClick={handleIncrementViewCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 rounded-2xl">
            <h3 className="text-2xl font-bold text-sky-800">لا توجد فيديوهات هنا بعد</h3>
            <p className="text-gray-600 mt-2">{searchQuery ? `لم يتم العثور على نتائج للبحث عن "${searchQuery}".` : 'جرب اختيار قائمة تشغيل أخرى أو أضف فيديوهات جديدة!'}</p>
          </div>
        )}

        {activities.length > 0 && (
            <div className="mt-16">
                 <h2 className="text-3xl font-bold text-gray-800 mb-6 border-r-8 border-green-500 pr-4">أنشطة وأوراق عمل</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {activities.map(activity => ( <ActivityCard key={activity.id} activity={activity} isAdmin={isLoggedIn} onDeleteActivity={handleDeleteActivity} /> ))}
                </div>
            </div>
        )}
      </main>
      
      {adSettings.ctaEnabled && <AdvertiserCta settings={adSettings} />}
      <Footer />
      {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
      {editingVideo && <EditVideoModal video={editingVideo} onUpdate={handleEditVideo} onClose={() => setEditingVideo(null)} />}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      <SyncIndicator isSyncing={isSyncing || isSubmittingFeedback} />
    </div>
  );
};

export default App;
