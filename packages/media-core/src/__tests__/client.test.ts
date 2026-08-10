import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PexelsClient } from '../client';

function jsonResponse(body: unknown, init?: { status?: number; statusText?: string }) {
  return {
    ok: (init?.status ?? 200) < 400,
    status: init?.status ?? 200,
    statusText: init?.statusText ?? 'OK',
    json: async () => body,
  } as Response;
}

const photosBody = {
  photos: [{ id: 1, alt: 'a photo' }],
  page: 1,
  per_page: 15,
  total_results: 100,
  next_page: 'https://api.pexels.com/v1/search?query=cats&page=2',
};

const videosBody = {
  videos: [{ id: 2 }],
  page: 1,
  per_page: 15,
  total_results: 50,
  next_page: 'https://api.pexels.com/videos/search?query=cats&page=2',
};

describe('PexelsClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(jsonResponse(photosBody));
    vi.stubGlobal('fetch', mockFetch);
  });

  it('searchPhotos builds the correct URL with Authorization header', async () => {
    const client = new PexelsClient({ apiKey: 'test-key' });
    await client.searchPhotos({ query: 'cats' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.pexels.com/v1/search?query=cats');
    expect(init.headers.Authorization).toBe('test-key');
  });

  it('searchPhotos response maps to PaginatedResult shape', async () => {
    const client = new PexelsClient({ apiKey: 'test-key' });
    const result = await client.searchPhotos({ query: 'cats' });

    expect(result.items).toEqual(photosBody.photos);
    expect(result.page).toBe(1);
    expect(result.per_page).toBe(15);
    expect(result.total_results).toBe(100);
    expect(result.hasNextPage).toBe(true);
    expect(result.nextPage).toBe(2);
  });

  it('cache hit: same params called twice → fetch called only once', async () => {
    const client = new PexelsClient({ apiKey: 'test-key' });
    await client.searchPhotos({ query: 'cats' });
    await client.searchPhotos({ query: 'cats' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('searchVideos uses /videos/search endpoint', async () => {
    mockFetch.mockResolvedValue(jsonResponse(videosBody));
    const client = new PexelsClient({ apiKey: 'test-key' });
    await client.searchVideos({ query: 'cats' });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/videos/search');
  });

  it('getCuratedPhotos uses /v1/curated endpoint', async () => {
    const client = new PexelsClient({ apiKey: 'test-key' });
    await client.getCuratedPhotos();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/curated');
  });

  it('getPhoto uses /v1/photos/{id}', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ id: 42 }));
    const client = new PexelsClient({ apiKey: 'test-key' });
    await client.getPhoto(42);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/photos/42');
  });

  it('404 response → throws Error containing "404"', async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, { status: 404, statusText: 'Not Found' }));
    const client = new PexelsClient({ apiKey: 'test-key' });

    await expect(client.getPhoto(1)).rejects.toThrow('404');
  });

  it('500 response → throws Error containing "500"', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({}, { status: 500, statusText: 'Internal Server Error' })
    );
    const client = new PexelsClient({ apiKey: 'test-key' });

    await expect(client.getPhoto(1)).rejects.toThrow('500');
  });

  it('failed fetch → cache evicts the key', async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, { status: 500, statusText: 'Error' }));
    const client = new PexelsClient({ apiKey: 'test-key' });

    await expect(client.getPhoto(1)).rejects.toThrow();
    // allow the cache's rejection handler (promise.catch) to run
    await new Promise(resolve => setTimeout(resolve, 0));

    mockFetch.mockResolvedValue(jsonResponse({ id: 1 }));
    await client.getPhoto(1);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
