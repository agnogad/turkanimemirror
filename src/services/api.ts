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

// Format slug to readable title e.g. "solo-leveling-season-2" -> "Solo Leveling Season 2"
export const slugToTitle = (slug: string): string => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Fetch anime cover image & banner directly from AniList GraphQL API
 */
export const fetchAniListMedia = async (searchTerm: string): Promise<AniListMedia | null> => {
  if (!searchTerm) return null;
  const cleanTerm = searchTerm.trim();

  if (aniListCache.has(cleanTerm)) {
    return aniListCache.get(cleanTerm)!;
  }

  // Check localStorage cache to speed up repeated queries across sessions
  const storageKey = `anilist_cover_${cleanTerm.toLowerCase()}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed: AniListMedia = JSON.parse(cached);
      aniListCache.set(cleanTerm, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
          large
        }
        bannerImage
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { search: cleanTerm },
      }),
    });

    if (!response.ok) throw new Error(`AniList HTTP status ${response.status}`);
    const json = await response.json();
    const media: AniListMedia | null = json?.data?.Media || null;

    aniListCache.set(cleanTerm, media);
    if (media) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(media));
      } catch (e) {}
    }
    return media;
  } catch (err) {
    console.error(`AniList fetch error for "${cleanTerm}":`, err);
    aniListCache.set(cleanTerm, null);
    return null;
  }
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
