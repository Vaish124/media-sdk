import { RequestCache } from './cache';
import type {
  PaginatedResult,
  PexelsPhoto,
  PexelsVideo,
  SDKConfig,
  SearchPhotosParams,
  SearchVideosParams,
} from './types';

interface PexelsPhotosResponse {
  photos: PexelsPhoto[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
}

interface PexelsVideosResponse {
  videos: PexelsVideo[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
}

export class PexelsClient {
  readonly #apiKey: string;
  private readonly baseUrl: string;
  private readonly cache = new RequestCache();

  constructor(config: SDKConfig) {
    this.#apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.pexels.com';
  }

  private async request<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }
    const key = url.toString();

    const cached = this.cache.get<T>(key);
    if (cached) {
      return cached;
    }

    const promise = fetch(key, {
      headers: { Authorization: this.#apiKey },
    }).then(async response => {
      if (!response.ok) {
        throw new Error(`Pexels API ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<T>;
    });

    return this.cache.set(key, promise);
  }

  private toPaginated<T>(
    items: T[],
    page: number,
    per_page: number,
    total_results: number,
    next_page?: string
  ): PaginatedResult<T> {
    const hasNextPage = Boolean(next_page);
    return {
      items,
      page,
      per_page,
      total_results,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null,
    };
  }

  async searchPhotos(params: SearchPhotosParams): Promise<PaginatedResult<PexelsPhoto>> {
    const { query, ...rest } = params;
    const response = await this.request<PexelsPhotosResponse>('/v1/search', {
      query,
      ...rest,
    });
    return this.toPaginated(
      response.photos,
      response.page,
      response.per_page,
      response.total_results,
      response.next_page
    );
  }

  async searchVideos(params: SearchVideosParams): Promise<PaginatedResult<PexelsVideo>> {
    const { query, ...rest } = params;
    const response = await this.request<PexelsVideosResponse>('/videos/search', {
      query,
      ...rest,
    });
    return this.toPaginated(
      response.videos,
      response.page,
      response.per_page,
      response.total_results,
      response.next_page
    );
  }

  async getCuratedPhotos(page = 1, per_page = 15): Promise<PaginatedResult<PexelsPhoto>> {
    const response = await this.request<PexelsPhotosResponse>('/v1/curated', {
      page,
      per_page,
    });
    return this.toPaginated(
      response.photos,
      response.page,
      response.per_page,
      response.total_results,
      response.next_page
    );
  }

  async getTrendingVideos(page = 1, per_page = 15): Promise<PaginatedResult<PexelsVideo>> {
    const response = await this.request<PexelsVideosResponse>('/videos/popular', {
      page,
      per_page,
    });
    return this.toPaginated(
      response.videos,
      response.page,
      response.per_page,
      response.total_results,
      response.next_page
    );
  }

  async getPhoto(id: number): Promise<PexelsPhoto> {
    return this.request<PexelsPhoto>(`/v1/photos/${id}`);
  }

  async getVideo(id: number): Promise<PexelsVideo> {
    return this.request<PexelsVideo>(`/videos/videos/${id}`);
  }
}
