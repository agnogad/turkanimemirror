import React, { useEffect, useState } from 'react';
import {
  Play,
  SkipForward,
  SkipBack,
  Server,
  Tv,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Zap,
  Info,
  Loader2,
  ExternalLink
} from 'lucide-react';
import {
  fetchEpisodePlayers,
  fetchAnimeEpisodes,
  slugToTitle
} from '../services/api';
import type { PlayerSource, EpisodeTuple } from '../services/api';
import type { WatchHistoryItem } from '../utils/storage';
import { saveWatchProgress } from '../utils/storage';

interface WatchPlayerProps {
  animeSlug: string;
  episodeSlug: string;
  history: WatchHistoryItem[];
  isFavorite: boolean;
  onSelectAnime: (slug: string) => void;
  onSelectEpisode: (animeSlug: string, episodeSlug: string) => void;
  onToggleFavorite: (e: React.MouseEvent, slug: string) => void;
  onBack: () => void;
  onHistoryUpdate: () => void;
}

export const WatchPlayer: React.FC<WatchPlayerProps> = ({
  animeSlug,
  episodeSlug,
  history,
  isFavorite,
  onSelectAnime,
  onSelectEpisode,
  onToggleFavorite,
  onBack,
  onHistoryUpdate,
}) => {
  const [players, setPlayers] = useState<PlayerSource[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [episodes, setEpisodes] = useState<EpisodeTuple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Fetch episode players & all episodes for navigation
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      fetchEpisodePlayers(animeSlug, episodeSlug),
      fetchAnimeEpisodes(animeSlug)
    ])
      .then(([playersData, episodesData]) => {
        if (!isMounted) return;
        setPlayers(playersData);
        setEpisodes(episodesData);
        
        // Find player with valid URL first if available
        const firstValidIndex = playersData.findIndex((p) => Boolean(p.url));
        setActivePlayerIndex(firstValidIndex > -1 ? firstValidIndex : 0);
        
        setIsLoading(false);

        // Save progress to history
        const animeTitle = slugToTitle(animeSlug);
        const epIndex = episodesData.findIndex(([slug]) => slug === episodeSlug);
        const epNumber = epIndex > -1 ? epIndex + 1 : 1;

        saveWatchProgress(
          animeSlug,
          episodeSlug,
          epNumber,
          animeTitle,
          '',
          120, // dummy progress
          1440 // 24 mins
        );
        onHistoryUpdate();
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [animeSlug, episodeSlug]);

  const animeTitle = slugToTitle(animeSlug);
  const episodeIndex = episodes.findIndex(([slug]) => slug === episodeSlug);
  const currentEpisodeTuple = episodeIndex > -1 ? episodes[episodeIndex] : null;

  const prevEpisode = episodeIndex > 0 ? episodes[episodeIndex - 1] : null;
  const nextEpisode = episodeIndex < episodes.length - 1 ? episodes[episodeIndex + 1] : null;

  const activePlayer = players[activePlayerIndex];

  return (
    <div className={`min-h-screen pb-16 ${isTheaterMode ? 'bg-[#000000]' : 'bg-vercel-grid'}`}>
      
      {/* Top Header Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f1f1f] pb-3">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <button
              onClick={onBack}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Geri
            </button>
            <span>/</span>
            <button
              onClick={() => onSelectAnime(animeSlug)}
              className="hover:text-white transition-colors truncate max-w-xs"
            >
              {animeTitle}
            </button>
            <span>/</span>
            <span className="text-white font-bold">
              {currentEpisodeTuple ? currentEpisodeTuple[1] : episodeSlug}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
                isTheaterMode
                  ? 'bg-white text-black border-white'
                  : 'bg-[#0a0a0a] text-neutral-300 border-[#262626] hover:border-neutral-500'
              }`}
            >
              <Zap className="w-3 h-3" />
              {isTheaterMode ? 'Sinema Modu Açık' : 'Sinema Modu'}
            </button>
          </div>

        </div>
      </div>

      {/* Main Video Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        
        {/* Player Server/Mirror Tabs */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-t-lg p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Server className="w-4 h-4 text-white" />
            <span>Oynatıcı Sunucusu:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {players.length > 0 ? (
              players.map((p, i) => (
                <button
                  key={`${p.player}-${i}`}
                  onClick={() => setActivePlayerIndex(i)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold shrink-0 transition-all ${
                    activePlayerIndex === i
                      ? 'bg-white text-black shadow'
                      : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
                  }`}
                >
                  {p.player || `Sunucu ${i + 1}`}
                  {p.fansub && <span className="ml-1 text-[10px] opacity-70">({p.fansub})</span>}
                </button>
              ))
            ) : (
              <span className="text-xs font-mono text-neutral-500">Varsayılan Sunucu</span>
            )}
          </div>
        </div>

        {/* Video Player Frame Container */}
        <div className="relative aspect-video w-full bg-[#050505] border-x border-b border-[#1f1f1f] rounded-b-lg overflow-hidden shadow-2xl flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-400 font-mono text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span>Video oynatıcı yükleniyor...</span>
            </div>
          ) : activePlayer && activePlayer.url ? (
            <iframe
              src={activePlayer.url}
              title={`${animeTitle} - ${currentEpisodeTuple ? currentEpisodeTuple[1] : episodeSlug}`}
              className="w-full h-full border-none"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="p-8 text-center space-y-4 max-w-md">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                <Play className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">
                  {activePlayer ? activePlayer.player : 'Sunucu'} Embed Oynatıcı
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Bu sunucu için harici embed bağlantısı hazırlandı. Yukarıdaki sunucu sekmelerinden (MAIL.RU, OK.RU, SENDVID) diğer alternatifleri deneyebilirsiniz.
                </p>
              </div>

              {activePlayer?.mask && (
                <a
                  href={`https://www.turkanime.co${activePlayer.mask}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white text-black font-mono font-bold text-xs hover:bg-neutral-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Harici Sayfada İzle
                </a>
              )}
            </div>
          )}
        </div>

        {/* Episode Controls Below Video */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center gap-2">
            <button
              disabled={!prevEpisode}
              onClick={() =>
                prevEpisode && onSelectEpisode(animeSlug, prevEpisode[0])
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#141414] hover:bg-neutral-800 text-neutral-200 border border-[#262626] disabled:opacity-40 font-mono text-xs font-semibold transition-colors"
            >
              <SkipBack className="w-3.5 h-3.5" /> Önceki Bölüm
            </button>

            <button
              disabled={!nextEpisode}
              onClick={() =>
                nextEpisode && onSelectEpisode(animeSlug, nextEpisode[0])
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-white hover:bg-neutral-200 text-black disabled:opacity-40 font-mono text-xs font-bold transition-colors shadow"
            >
              Sonraki Bölüm <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleFavorite(e, animeSlug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold border transition-all ${
                isFavorite
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                  : 'bg-[#141414] text-neutral-300 border-[#262626] hover:border-neutral-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isFavorite ? 'Favorilerinde' : 'Favorilere Ekle'}
            </button>

            <button
              onClick={() => onSelectAnime(animeSlug)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] hover:bg-neutral-800 text-neutral-300 border border-[#262626] font-mono text-xs font-semibold transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-neutral-400" /> Anime Detayı
            </button>
          </div>
        </div>

        {/* Sidebar & All Episodes List */}
        <div className="mt-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-neutral-400" />
              Tüm Bölümler ({episodes.length})
            </h3>
            <span className="text-xs font-mono text-neutral-500">
              {currentEpisodeTuple ? currentEpisodeTuple[1] : episodeSlug}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
            {episodes.map(([epSlug, epTitle], index) => {
              const isActive = epSlug === episodeSlug;
              const isWatched = history.some(
                (h) => h.animeId === animeSlug && h.episodeId === epSlug
              );

              return (
                <div
                  key={epSlug}
                  onClick={() => onSelectEpisode(animeSlug, epSlug)}
                  className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-white text-black border-white shadow'
                      : isWatched
                      ? 'bg-[#141414] border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      : 'bg-[#121212] border-[#1f1f1f] text-neutral-400 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isActive
                          ? 'bg-black text-white'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold truncate">
                      {epTitle}
                    </span>
                  </div>

                  {isWatched && !isActive && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
