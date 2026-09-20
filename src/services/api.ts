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

// Cache map to avoid redundant network requests
const infoCache = new Map<string, AnimeInfo>();
const episodesCache = new Map<string, EpisodeTuple[]>();
const playerCache = new Map<string, PlayerSource[]>();

// Format slug to readable title e.g. "solo-leveling-season-2" -> "Solo Leveling Season 2"
export const slugToTitle = (slug: string): string => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
      'solo-leveling',
      'jujutsu-kaisen-s2',
      'demon-slayer-hashira',
      'sousou-no-frieren',
      'shingeki-no-kyojin',
      'chainsaw-man',
      'naruto-shippuuden',
      'one-piece',
      'death-note',
      'bleach'
    ];
  }
};

// Fetch info metadata for a single anime slug
export const fetchAnimeInfo = async (slug: string): Promise<AnimeInfo | null> => {
  if (infoCache.has(slug)) return infoCache.get(slug)!;

  try {
    const res = await fetch(`${BASE_URL}/${slug}/info.json`);
    if (!res.ok) throw new Error(`Info not found for ${slug}`);
    const data: AnimeInfo = await res.json();
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
