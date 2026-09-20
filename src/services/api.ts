export interface AnimeInfo {
  Kategori?: string;
  Japonca?: string;
  "Anime Türü"?: string[];
  "Bölüm Sayısı"?: string;
  "Başlama Tarihi"?: string;
  "Bitiş Tarihi"?: string;
  Stüdyo?: string | null;
  Puanı?: number;
  Özet?: string;
  Resim?: string;
  Banner?: string;
}

export interface AniListMedia {
  title?: {
    romaji?: string;
    english?: string;
  };
  coverImage?: {
    extraLarge?: string;
    large?: string;
  };
  bannerImage?: string;
}

export type EpisodeTuple = [string, string]; // [episodeSlug, episodeTitle]

export interface PlayerSource {
  player: string;
  url?: string;
  path?: string;
  fansub?: string;
  mask?: string;
}

const BASE_URL = 'https://raw.githubusercontent.com/agnogad/TurkAnimeTV_Arsiv_json/main/animeler';

// In-memory cache maps
const infoCache = new Map<string, AnimeInfo>();
const episodesCache = new Map<string, EpisodeTuple[]>();
const playerCache = new Map<string, PlayerSource[]>();
const aniListCache = new Map<string, AniListMedia | null>();

// Queue structures for auto-batching AniList GraphQL queries
interface PendingRequest {
  term: string;
  resolve: (media: AniListMedia | null) => void;
}

let pendingBatchQueue: PendingRequest[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

// Format slug to readable title e.g. "solo-leveling-season-2" -> "Solo Leveling Season 2"
export const slugToTitle = (slug: string): string => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Executes a batched GraphQL query for multiple search terms in ONE single HTTP request
 * Uses GraphQL query aliases (a0, a1, a2...) to eliminate Rate Limit (429) errors.
 */
export const fetchAniListBatchMedia = async (
  searchTerms: string[]
): Promise<Map<string, AniListMedia | null>> => {
  const results = new Map<string, AniListMedia | null>();
  if (!searchTerms || searchTerms.length === 0) return results;

  // Filter terms that need to be fetched (not in memory or localStorage cache)
  const termsToFetch: string[] = [];
  
  for (const rawTerm of searchTerms) {
    if (!rawTerm) continue;
    const cleanTerm = rawTerm.trim();
    if (aniListCache.has(cleanTerm)) {
      results.set(cleanTerm, aniListCache.get(cleanTerm)!);
      continue;
    }

    const storageKey = `anilist_cover_${cleanTerm.toLowerCase()}`;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed: AniListMedia = JSON.parse(cached);
        aniListCache.set(cleanTerm, parsed);
        results.set(cleanTerm, parsed);
        continue;
      }
    } catch (e) {}

    termsToFetch.push(cleanTerm);
  }

  if (termsToFetch.length === 0) {
    return results;
  }

  // Deduplicate terms to fetch
  const uniqueTermsToFetch = Array.from(new Set(termsToFetch));

  // Chunk requests into batches of max 20 per GraphQL request to stay well within query complexity limits
  const CHUNK_SIZE = 20;

  for (let i = 0; i < uniqueTermsToFetch.length; i += CHUNK_SIZE) {
    const chunk = uniqueTermsToFetch.slice(i, i + CHUNK_SIZE);
    const fields = chunk.map((term, idx) => {
      const safeTerm = term.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `a${idx}: Media(search: "${safeTerm}", type: ANIME) { title { romaji english } coverImage { extraLarge large } bannerImage }`;
    });

    const query = `query { ${fields.join(' ')} }`;

    try {
      const response = await fetch('https://graphql.anilist.co/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error(`AniList HTTP status ${response.status}`);
      const json = await response.json();
      const dataObj = json?.data || {};

      chunk.forEach((term, idx) => {
        const mediaItem: AniListMedia | null = dataObj[`a${idx}`] || null;
        aniListCache.set(term, mediaItem);
        results.set(term, mediaItem);

        if (mediaItem) {
          try {
            localStorage.setItem(
              `anilist_cover_${term.toLowerCase()}`,
              JSON.stringify(mediaItem)
            );
          } catch (e) {}
        }
      });
    } catch (err) {
      console.error('AniList batch fetch error:', err);
      chunk.forEach((term) => {
        aniListCache.set(term, null);
        results.set(term, null);
      });
    }
  }

  return results;
};

// Process accumulated pending requests in microtask batch
const processPendingBatch = async () => {
  if (pendingBatchQueue.length === 0) return;

  const currentQueue = [...pendingBatchQueue];
  pendingBatchQueue = [];
  batchTimer = null;

  // Group resolvers by search term
  const termResolvers = new Map<string, Array<(media: AniListMedia | null) => void>>();

  currentQueue.forEach(({ term, resolve }) => {
    if (!termResolvers.has(term)) {
      termResolvers.set(term, []);
    }
    termResolvers.get(term)!.push(resolve);
  });

  const terms = Array.from(termResolvers.keys());
  const batchResults = await fetchAniListBatchMedia(terms);

  terms.forEach((term) => {
    const media = batchResults.get(term) || null;
    const resolvers = termResolvers.get(term) || [];
    resolvers.forEach((r) => r(media));
  });
};

/**
 * Fetch anime cover image & banner directly from AniList GraphQL API.
 * Automatically queues and batches requests made within the same tick/frame to prevent 429 Rate Limit.
 */
export const fetchAniListMedia = (searchTerm: string): Promise<AniListMedia | null> => {
  if (!searchTerm) return Promise.resolve(null);
  const cleanTerm = searchTerm.trim();

  // 1. Check in-memory cache
  if (aniListCache.has(cleanTerm)) {
    return Promise.resolve(aniListCache.get(cleanTerm)!);
  }

  // 2. Check localStorage cache
  const storageKey = `anilist_cover_${cleanTerm.toLowerCase()}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed: AniListMedia = JSON.parse(cached);
      aniListCache.set(cleanTerm, parsed);
      return Promise.resolve(parsed);
    }
  } catch (e) {}

  // 3. Queue for auto-batched single GraphQL POST request
  return new Promise((resolve) => {
    pendingBatchQueue.push({ term: cleanTerm, resolve });
    if (!batchTimer) {
      batchTimer = setTimeout(processPendingBatch, 30);
    }
  });
};

// Fetch full list of anime slugs e.g. ["0-saiji-start-dash-monogatari", ...]
export const fetchAnimeList = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${BASE_URL}/animeler.json`);
    if (!res.ok) throw new Error('Failed to fetch anime list');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('API Error (fetchAnimeList):', error);
    return [
      'jujutsu-kaisen',
      'jujutsu-kaisen-2nd-season',
      'sousou-no-frieren',
      'shingeki-no-kyojin',
      'chainsaw-man',
      'naruto',
      'one-piece',
      'bleach',
      'death-note',
      'hunter-x-hunter-2011'
    ];
  }
};

// Fetch info metadata for a single anime slug, automatically populated with AniList cover image & banner
export const fetchAnimeInfo = async (slug: string): Promise<AnimeInfo | null> => {
  if (infoCache.has(slug)) return infoCache.get(slug)!;

  try {
    const res = await fetch(`${BASE_URL}/${slug}/info.json`);
    let data: AnimeInfo = res.ok ? await res.json() : {};

    // Fetch high quality cover image from AniList GraphQL
    const searchTitle = slugToTitle(slug);
    const aniListMedia = await fetchAniListMedia(searchTitle);

    if (aniListMedia?.coverImage?.extraLarge || aniListMedia?.coverImage?.large) {
      data.Resim = aniListMedia.coverImage.extraLarge || aniListMedia.coverImage.large;
    }
    if (aniListMedia?.bannerImage) {
      data.Banner = aniListMedia.bannerImage;
    }

    infoCache.set(slug, data);
    return data;
  } catch (error) {
    console.error(`API Error (fetchAnimeInfo ${slug}):`, error);
    return null;
  }
};

// Fetch episode list for an anime slug
export const fetchAnimeEpisodes = async (slug: string): Promise<EpisodeTuple[]> => {
  if (episodesCache.has(slug)) return episodesCache.get(slug)!;

  try {
    const res = await fetch(`${BASE_URL}/${slug}/bolumler.json`);
    if (!res.ok) throw new Error(`Episodes not found for ${slug}`);
    const data: EpisodeTuple[] = await res.json();
    episodesCache.set(slug, data);
    return data;
  } catch (error) {
    console.error(`API Error (fetchAnimeEpisodes ${slug}):`, error);
    return [];
  }
};

// Fetch player sources for an episode
export const fetchEpisodePlayers = async (
  animeSlug: string,
  episodeSlug: string
): Promise<PlayerSource[]> => {
  const cacheKey = `${animeSlug}/${episodeSlug}`;
  if (playerCache.has(cacheKey)) return playerCache.get(cacheKey)!;

  try {
    const res = await fetch(`${BASE_URL}/${animeSlug}/${episodeSlug}.json`);
    if (!res.ok) throw new Error(`Players not found for ${episodeSlug}`);
    const data: PlayerSource[] = await res.json();
    playerCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`API Error (fetchEpisodePlayers ${episodeSlug}):`, error);
    return [];
  }
};
