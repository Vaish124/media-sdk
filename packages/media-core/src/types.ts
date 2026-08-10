export interface SDKConfig {
  apiKey: string;
  baseUrl?: string; // default: 'https://api.pexels.com'
}

export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  liked: boolean;
  alt: string;
}

export interface PexelsVideoFile {
  id: number;
  quality: 'sd' | 'hd' | 'uhd';
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: { id: number; name: string; url: string };
  video_files: PexelsVideoFile[];
  video_pictures: Array<{ id: number; picture: string; nr: number }>;
}

export type MediaItem = PexelsPhoto | PexelsVideo;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  per_page: number;
  total_results: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

export type MediaEventType = 'view' | 'download';

export interface MediaEvent {
  type: MediaEventType;
  itemId: number;
  itemType: 'photo' | 'video';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface SearchPhotosParams {
  query: string;
  page?: number;
  per_page?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  color?: string;
  locale?: string;
}

export interface SearchVideosParams {
  query: string;
  page?: number;
  per_page?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  locale?: string;
}
