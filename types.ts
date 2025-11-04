export interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  views: number;
}

export interface Playlist {
  id: number;
  name: string;
  videoIds: number[];
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Ad {
  id: number;
  text: string;
  imageUrl: string | null;
  link: string;
}

export interface AdSettings {
  ads: Ad[];
  ctaEnabled: boolean;
  ctaText: string;
  ctaLink: string;
}