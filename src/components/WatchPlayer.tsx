import React, { useEffect, useState, useRef } from 'react';
import {
  SkipForward,
  SkipBack,
  Tv,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Zap,
  Info,
  Loader2,
  ChevronDown,
  Radio,
  AlertCircle,
  Search,
  Star,
  X,
  Check,
  Users,
  Layers
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

const PRIORITY_SERVERS = ['sibnet', 'voe', 'dailymotion'];

export const isPriorityPlayer = (playerName: string): boolean => {
  if (!playerName) return false;
  const lower = playerName.toLowerCase();
  return PRIORITY_SERVERS.some((name) => lower.includes(name));
};

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

  // Filter States
  const [selectedFansub, setSelectedFansub] = useState<string>('ALL');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');

  // Custom Dropdown Open States & Refs
  const [isPlayerSelectorOpen, setIsPlayerSelectorOpen] = useState(false);
  const [isFansubSelectorOpen, setIsFansubSelectorOpen] = useState(false);
  const [isProviderSelectorOpen, setIsProviderSelectorOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');

  const playerSelectorRef = useRef<HTMLDivElement>(null);
  const fansubSelectorRef = useRef<HTMLDivElement>(null);
  const providerSelectorRef = useRef<HTMLDivElement>(null);

  // Close custom selectors on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (playerSelectorRef.current && !playerSelectorRef.current.contains(e.target as Node)) {
        setIsPlayerSelectorOpen(false);
      }
      if (fansubSelectorRef.current && !fansubSelectorRef.current.contains(e.target as Node)) {
        setIsFansubSelectorOpen(false);
      }
      if (providerSelectorRef.current && !providerSelectorRef.current.contains(e.target as Node)) {
        setIsProviderSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        setEpisodes(episodesData);
        
        // 1. Filter ONLY players that have a valid https:// direct embed url
        const httpsPlayers = playersData.filter(
          (p) => Boolean(p.url) && p.url!.startsWith('https://')
        );

        // 2. Priority Sort: sibnet, voe, dailymotion go FIRST
        const sortedPlayers = [...httpsPlayers].sort((a, b) => {
          const aPrio = isPriorityPlayer(a.player);
          const bPrio = isPriorityPlayer(b.player);
          if (aPrio && !bPrio) return -1;
          if (!aPrio && bPrio) return 1;
          return 0;
        });

        setPlayers(sortedPlayers);
        setActivePlayerIndex(0);
        setSelectedFansub('ALL');
        setSelectedProvider('ALL');
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

  // Unique Fansubs & Providers list for filter dropdowns
  const uniqueFansubs = Array.from(
    new Set(players.map((p) => p.fansub).filter(Boolean))
  ) as string[];

  const uniqueProviders = Array.from(
    new Set(players.map((p) => p.player).filter(Boolean))
  ) as string[];

  // Players filtered by Fansub and Provider criteria
  const availablePlayers = players.filter((p) => {
    const matchesFansub = selectedFansub === 'ALL' || p.fansub === selectedFansub;
    const matchesProvider = selectedProvider === 'ALL' || p.player === selectedProvider;
    return matchesFansub && matchesProvider;
  });

  // Active player object
  const activePlayer = availablePlayers[activePlayerIndex] || availablePlayers[0] || players[0];

  // Players filtered by search term in main custom player selector
  const searchedPlayers = availablePlayers.filter((p) => {
    if (!selectorSearch.trim()) return true;
    const term = selectorSearch.toLowerCase();
    return (
      p.player.toLowerCase().includes(term) ||
      (p.fansub && p.fansub.toLowerCase().includes(term))
    );
  });

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
        
        {/* Vercel Custom Control Header Box */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-t-xl p-3 sm:p-4 space-y-3">
          
          {/* Header Row: Title & Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Oynatıcı Sunucusu
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {availablePlayers.length} / {players.length} HTTPS Kaynak
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-500 hidden sm:block">
                  ★ Sibnet, Voe ve Dailymotion öncelikli • Özel filtreli arama seçici
                </p>
              </div>
            </div>
          </div>

          {/* Controls Grid: 3 Custom Selectors (Fansub, Provider, Player Selector) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-[#1a1a1a]">
            
            {/* 1. CUSTOM FANSUB FILTER SELECTOR */}
            <div ref={fansubSelectorRef} className="relative">
              <label className="block text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
                Fansub Filtresi:
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsFansubSelectorOpen(!isFansubSelectorOpen);
                  setIsProviderSelectorOpen(false);
                  setIsPlayerSelectorOpen(false);
                }}
                className="w-full flex items-center justify-between bg-[#141414] hover:bg-[#1a1a1a] text-white text-xs font-mono font-bold py-2 px-3 rounded-lg border border-[#262626] focus:border-white transition-all shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">
                    {selectedFansub === 'ALL' ? 'Tüm Fansublar' : selectedFansub}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isFansubSelectorOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {isFansubSelectorOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-[#262626] rounded-xl shadow-2xl z-50 overflow-hidden text-xs font-mono backdrop-blur-2xl py-1">
                  <div
                    onClick={() => {
                      setSelectedFansub('ALL');
                      setActivePlayerIndex(0);
                      setIsFansubSelectorOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                      selectedFansub === 'ALL'
                        ? 'bg-white text-black font-bold'
                        : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
                    }`}
                  >
                    <span>Tüm Fansublar ({players.length})</span>
                    {selectedFansub === 'ALL' && <Check className="w-3.5 h-3.5 text-black" />}
                  </div>
                  {uniqueFansubs.map((sub) => {
                    const count = players.filter((p) => p.fansub === sub).length;
                    const isSelected = selectedFansub === sub;
                    return (
                      <div
                        key={`fansub-opt-${sub}`}
                        onClick={() => {
                          setSelectedFansub(sub);
                          setActivePlayerIndex(0);
                          setIsFansubSelectorOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-white text-black font-bold'
                            : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{sub}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] ${isSelected ? 'text-neutral-700' : 'text-neutral-500'}`}>
                            ({count})
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. CUSTOM PROVIDER (SAĞLAYICI) FILTER SELECTOR */}
            <div ref={providerSelectorRef} className="relative">
              <label className="block text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
                Sağlayıcı Filtresi:
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsProviderSelectorOpen(!isProviderSelectorOpen);
                  setIsFansubSelectorOpen(false);
                  setIsPlayerSelectorOpen(false);
                }}
                className="w-full flex items-center justify-between bg-[#141414] hover:bg-[#1a1a1a] text-white text-xs font-mono font-bold py-2 px-3 rounded-lg border border-[#262626] focus:border-white transition-all shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <Layers className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">
                    {selectedProvider === 'ALL' ? 'Tüm Sağlayıcılar' : selectedProvider}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isProviderSelectorOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {isProviderSelectorOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-[#262626] rounded-xl shadow-2xl z-50 overflow-hidden text-xs font-mono backdrop-blur-2xl py-1 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => {
                      setSelectedProvider('ALL');
                      setActivePlayerIndex(0);
                      setIsProviderSelectorOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                      selectedProvider === 'ALL'
                        ? 'bg-white text-black font-bold'
                        : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
                    }`}
                  >
                    <span>Tüm Sağlayıcılar ({players.length})</span>
                    {selectedProvider === 'ALL' && <Check className="w-3.5 h-3.5 text-black" />}
                  </div>
                  {uniqueProviders.map((prov) => {
                    const count = players.filter((p) => p.player === prov).length;
                    const isSelected = selectedProvider === prov;
                    const isStarred = isPriorityPlayer(prov);

                    return (
                      <div
                        key={`prov-opt-${prov}`}
                        onClick={() => {
                          setSelectedProvider(prov);
                          setActivePlayerIndex(0);
                          setIsProviderSelectorOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-white text-black font-bold'
                            : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isStarred && (
                            <Star className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-600 fill-amber-600' : 'text-amber-400 fill-amber-400'}`} />
                          )}
                          <span className="truncate">{prov}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] ${isSelected ? 'text-neutral-700' : 'text-neutral-500'}`}>
                            ({count})
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. MAIN CUSTOM SEARCHABLE PLAYER SELECTOR */}
            <div ref={playerSelectorRef} className="relative">
              <label className="block text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
                Aktif Sunucu ({availablePlayers.length}):
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsPlayerSelectorOpen(!isPlayerSelectorOpen);
                  setIsFansubSelectorOpen(false);
                  setIsProviderSelectorOpen(false);
                }}
                disabled={availablePlayers.length === 0}
                className="w-full flex items-center justify-between bg-[#141414] hover:bg-[#1a1a1a] text-white text-xs font-mono font-bold py-2 px-3 rounded-lg border border-[#262626] focus:border-white transition-all shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {activePlayer && isPriorityPlayer(activePlayer.player) && (
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  )}
                  <span className="truncate">
                    {activePlayer ? activePlayer.player : 'Sunucu Seçin'}
                  </span>
                  {activePlayer?.fansub && (
                    <span className="text-[10px] font-normal text-neutral-400 px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 shrink-0">
                      {activePlayer.fansub}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2 text-neutral-400">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPlayerSelectorOpen ? 'rotate-180 text-white' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu Panel with Search Input */}
              {isPlayerSelectorOpen && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-[#0a0a0a] border border-[#262626] rounded-xl shadow-2xl z-50 overflow-hidden text-xs font-mono backdrop-blur-2xl">
                  
                  {/* Search Input Box inside Selector */}
                  <div className="p-2 border-b border-[#1f1f1f] relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Sunucu ara (örn: Sibnet, Voe)..."
                      value={selectorSearch}
                      onChange={(e) => setSelectorSearch(e.target.value)}
                      className="w-full bg-[#121212] text-white placeholder-neutral-500 pl-8 pr-7 py-1.5 rounded-md border border-[#262626] focus:outline-none focus:border-neutral-500 text-xs"
                      autoFocus
                    />
                    {selectorSearch && (
                      <button
                        onClick={() => setSelectorSearch('')}
                        className="absolute right-3 text-neutral-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                    {searchedPlayers.length > 0 ? (
                      searchedPlayers.map((p) => {
                        const originalIndex = availablePlayers.indexOf(p);
                        const isSelected = activePlayerIndex === originalIndex;
                        const isStarred = isPriorityPlayer(p.player);

                        return (
                          <div
                            key={`custom-opt-${p.player}-${originalIndex}`}
                            onClick={() => {
                              setActivePlayerIndex(originalIndex);
                              setIsPlayerSelectorOpen(false);
                              setSelectorSearch('');
                            }}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-white text-black font-bold'
                                : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isStarred ? (
                                <Star
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelected
                                      ? 'text-amber-600 fill-amber-600'
                                      : 'text-amber-400 fill-amber-400'
                                  }`}
                                />
                              ) : (
                                <span className="w-3.5 h-3.5 shrink-0 text-center opacity-40">•</span>
                              )}

                              <span className="truncate">{p.player}</span>

                              {p.fansub && (
                                <span
                                  className={`text-[10px] font-normal px-1 py-0.2 rounded shrink-0 ${
                                    isSelected
                                      ? 'bg-neutral-200 text-neutral-900'
                                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                                  }`}
                                >
                                  {p.fansub}
                                </span>
                              )}
                            </div>

                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-black shrink-0 ml-2" />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-neutral-500 text-xs">
                        Filtreye uygun sunucu bulunamadı.
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>

        {/* Video Player Frame Container */}
        <div className="relative aspect-video w-full bg-[#050505] border-x border-b border-[#1f1f1f] rounded-b-xl overflow-hidden shadow-2xl flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-400 font-mono text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span>HTTPS video kaynağı yükleniyor...</span>
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
            <div className="p-8 text-center space-y-3 max-w-md">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">
                  HTTPS Oynatıcı Bulunamadı
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Bu filtreye veya bölüme ait direkt oynatılabilecek güvenli HTTPS embed kaynağı bulunamadı. Filtreleri temizleyebilirsiniz.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Episode Controls Below Video */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-4">
          <div className="flex items-center gap-2">
            <button
              disabled={!prevEpisode}
              onClick={() =>
                prevEpisode && onSelectEpisode(animeSlug, prevEpisode[0])
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#141414] hover:bg-neutral-800 text-neutral-200 border border-[#262626] disabled:opacity-40 font-mono text-xs font-semibold transition-colors"
            >
              <SkipBack className="w-3.5 h-3.5" /> Önceki Bölüm
            </button>

            <button
              disabled={!nextEpisode}
              onClick={() =>
                nextEpisode && onSelectEpisode(animeSlug, nextEpisode[0])
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black disabled:opacity-40 font-mono text-xs font-bold transition-colors shadow"
            >
              Sonraki Bölüm <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleFavorite(e, animeSlug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-neutral-800 text-neutral-300 border border-[#262626] font-mono text-xs font-semibold transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-neutral-400" /> Anime Detayı
            </button>
          </div>
        </div>

        {/* Sidebar & All Episodes List */}
        <div className="mt-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-5 space-y-4">
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
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
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
