import React, { useEffect, useState } from 'react';
import {
  Star,
  Play,
  Heart,
  Tv,
  Search,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Film,
  Sparkles,
} from 'lucide-react';
import { fetchAnimeInfo, fetchAnimeEpisodes, slugToTitle } from '../services/api';
import type { AnimeInfo, EpisodeTuple } from '../services/api';
import type { WatchHistoryItem } from '../utils/storage';

interface AnimeDetailProps {
  slug: string;
  isFavorite: boolean;
  history: WatchHistoryItem[];
  onToggleFavorite: (e: React.MouseEvent, slug: string) => void;
  onWatchEpisode: (animeSlug: string, episodeSlug: string) => void;
  onBack: () => void;
}

export const AnimeDetail: React.FC<AnimeDetailProps> = ({
  slug,
  isFavorite,
  history,
  onToggleFavorite,
  onWatchEpisode,
  onBack,
}) => {
  const [info, setInfo] = useState<AnimeInfo | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeTuple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [episodeSearch, setEpisodeSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([fetchAnimeInfo(slug), fetchAnimeEpisodes(slug)])
      .then(([infoData, episodesData]) => {
        if (!isMounted) return;
        setInfo(infoData);
        setEpisodes(episodesData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const animeTitle = slugToTitle(slug);

  const filteredEpisodes = episodes.filter(([epSlug, epTitle]) =>
    epTitle.toLowerCase().includes(episodeSearch.toLowerCase()) ||
    epSlug.toLowerCase().includes(episodeSearch.toLowerCase())
  );

  const isEpisodeWatched = (epSlug: string) => {
    return history.some((h) => h.animeId === slug && h.episodeId === epSlug);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#0a0a0a] hover:bg-neutral-800 text-xs font-mono text-neutral-400 hover:text-white border border-[#262626] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Geri Arama Sayfası
      </button>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="text-xs font-mono text-neutral-400">Anime verileri yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Poster Image & Quick Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-[#262626] bg-[#0a0a0a]">
              {info?.Resim ? (
                <img
                  src={info.Resim}
                  alt={animeTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-500 font-mono text-xs">
                  <Film className="w-10 h-10 mb-2 opacity-50" />
                  <span>Resim Yok</span>
                </div>
              )}

              {info?.Puanı !== undefined && (
                <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded bg-black/90 backdrop-blur-md text-amber-400 text-xs font-mono font-bold border border-amber-500/30 flex items-center gap-1 shadow">
                  <Star className="w-3 h-3 fill-amber-400" /> {info.Puanı} / 10
                </span>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2.5">
              {episodes.length > 0 && (
                <button
                  onClick={() => onWatchEpisode(slug, episodes[0][0])}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-colors shadow"
                >
                  <Play className="w-4 h-4 fill-black" />
                  1. Bölümü İzle
                </button>
              )}

              <button
                onClick={(e) => onToggleFavorite(e, slug)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-md font-semibold text-xs border transition-all ${
                  isFavorite
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                    : 'bg-[#0a0a0a] text-neutral-300 border-[#262626] hover:border-neutral-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                {isFavorite ? 'Favorilerinde Ekli' : 'Favorilerime Ekle'}
              </button>
            </div>

            {/* Meta Table */}
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2">
                <span className="text-neutral-500">Kategori:</span>
                <span className="text-white font-bold">{info?.Kategori || 'TV'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2">
                <span className="text-neutral-500">Stüdyo:</span>
                <span className="text-white font-bold">{info?.Stüdyo || 'Belirtilmedi'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2">
                <span className="text-neutral-500">Bölüm Sayısı:</span>
                <span className="text-white font-bold">{info?.['Bölüm Sayısı'] || episodes.length}</span>
              </div>
              {info?.['Başlama Tarihi'] && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Tarih:</span>
                  <span className="text-neutral-300 truncate max-w-[150px]">{info['Başlama Tarihi']}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title, Synopsis & Episode List */}
          <div className="lg:col-span-3 space-y-6">
            
            <div>
              {info?.['Anime Türü'] && info['Anime Türü'].length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {info['Anime Türü'].map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 text-[11px] font-mono"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {animeTitle}
              </h1>
              {info?.Japonca && (
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Japonca: {info.Japonca}
                </p>
              )}
            </div>

            {/* Özet Section */}
            {info?.Özet && (
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-200" /> Anime Özeti
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {info.Özet}
                </p>
              </div>
            )}

            {/* Episodes List Section */}
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-neutral-400" />
                  Bölüm Listesi ({episodes.length} Bölüm)
                </h3>

                {/* Episode Search Bar */}
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Bölüm ara..."
                    value={episodeSearch}
                    onChange={(e) => setEpisodeSearch(e.target.value)}
                    className="w-full bg-[#121212] text-xs text-white placeholder-neutral-500 pl-8 pr-3 py-1.5 rounded border border-[#262626] focus:outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              {/* Episode Grid */}
              {filteredEpisodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredEpisodes.map(([epSlug, epTitle], index) => {
                    const watched = isEpisodeWatched(epSlug);
                    return (
                      <div
                        key={epSlug}
                        onClick={() => onWatchEpisode(slug, epSlug)}
                        className={`p-3 rounded border transition-all cursor-pointer flex items-center justify-between group ${
                          watched
                            ? 'bg-neutral-900/50 border-neutral-700 text-neutral-200'
                            : 'bg-[#121212] border-[#1f1f1f] hover:border-neutral-500 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded bg-neutral-900 text-neutral-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-neutral-800 group-hover:bg-white group-hover:text-black transition-colors">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold truncate">
                            {epTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {watched && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                          <Play className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-neutral-500 font-mono">
                  {episodes.length === 0
                    ? 'Bu anime için henüz bölüm verisi bulunamadı.'
                    : `"${episodeSearch}" ile eşleşen bölüm bulunamadı.`}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
