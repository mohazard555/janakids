import type { Video, Playlist, Activity } from './types';

export const INITIAL_CHANNEL_LOGO: string | null = null;

export const INITIAL_CHANNEL_DESCRIPTION: string = "قناة جنى كيدز تقدم لكم أجمل قصص الأطفال التعليمية والترفيهية. انضموا إلينا في مغامرات شيقة وممتعة!";

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 1690000000001,
    title: "قصة الأسد والفأر | قصص اطفال قبل النوم",
    thumbnailUrl: "https://img.youtube.com/vi/OPsY-ltL_dY/sddefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=OPsY-ltL_dY",
    views: 15234
  },
  {
    id: 1690000000002,
    title: "مغامرات ماشا والدب الجديدة",
    thumbnailUrl: "https://img.youtube.com/vi/g-zTf3sXJ4k/sddefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=g-zTf3sXJ4k",
    views: 89456
  },
  {
    id: 1690000000003,
    title: "أغنية الألوان للأطفال",
    thumbnailUrl: "https://img.youtube.com/vi/--41ia1BJUw/sddefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=--41ia1BJUw",
    views: 20187
  }
];

export const INITIAL_SHORTS: Video[] = [
    {
        id: 1690000000101,
        title: "خدعة سحرية ممتعة",
        thumbnailUrl: "https://img.youtube.com/vi/ud95h4nAG4g/sddefault.jpg",
        youtubeUrl: "https://www.youtube.com/shorts/ud95h4nAG4g",
        views: 9876
    },
    {
        id: 1690000000102,
        title: "كيف ترسم قطة؟",
        thumbnailUrl: "https://img.youtube.com/vi/VufDd-QL1cE/sddefault.jpg",
        youtubeUrl: "https://www.youtube.com/shorts/VufDd-QL1cE",
        views: 5432
    }
];

export const INITIAL_ACTIVITIES: Activity[] = [
    {
        id: 1690000000201,
        title: "تلوين الأسد",
        description: "اطبع هذه الصورة ولونها بألوانك المفضلة!",
        imageUrl: "https://i.imgur.com/O6S6e6E.png"
    },
    {
        id: 1690000000202,
        title: "متاهة القرد",
        description: "ساعد القرد للوصول إلى الموز!",
        imageUrl: "https://i.imgur.com/2g3a4bH.png"
    }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
    {
        id: 1690000000301,
        name: "قصص الحيوانات",
        videoIds: [1690000000001]
    },
    {
        id: 1690000000302,
        name: "أغاني ومرح",
        videoIds: [1690000000003]
    }
];

export const INITIAL_CREDENTIALS = { username: "admin", password: "password" };
