import type { WatchHistoryItem } from '../data/animeData';

export type { WatchHistoryItem };

const HISTORY_KEY = 'turkanime_mirror_history';
const FAVORITES_KEY = 'turkanime_mirror_favorites';

export const getWatchHistory = (): WatchHistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load watch history:', e);
    return [];
  }
};

export const saveWatchProgress = (
  animeId: string,
  episodeId: string,
  episodeNumber: number,
  animeTitle: string,
  animeCover: string,
  progressSeconds: number,
  totalSeconds: number
) => {
  if (!totalSeconds || isNaN(totalSeconds)) return;
  
  const history = getWatchHistory();
  const existingIndex = history.findIndex(
    (item) => item.animeId === animeId && item.episodeId === episodeId
  );

  const newItem: WatchHistoryItem = {
    animeId,
    episodeId,
    episodeNumber,
    animeTitle,
    animeCover,
    progressSeconds: Math.floor(progressSeconds),
    totalSeconds: Math.floor(totalSeconds),
    lastWatchedAt: Date.now()
  };

  if (existingIndex > -1) {
    history.splice(existingIndex, 1);
  }

  // Prepend to top
  history.unshift(newItem);

  // Keep last 20
  const trimmed = history.slice(0, 20);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
};

export const clearWatchHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
};

export const removeHistoryItem = (animeId: string, episodeId: string): WatchHistoryItem[] => {
  const history = getWatchHistory().filter(
    (item) => !(item.animeId === animeId && item.episodeId === episodeId)
  );
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to remove history item:', e);
  }
  return history;
};

export const getFavorites = (): string[] => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const toggleFavorite = (animeId: string): string[] => {
  const favorites = getFavorites();
  const index = favorites.indexOf(animeId);
  let updated: string[];
  if (index > -1) {
    updated = favorites.filter((id) => id !== animeId);
  } else {
    updated = [...favorites, animeId];
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
  return updated;
};
