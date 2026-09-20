import React, { useState } from 'react';
import { Play, Info, Star, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Anime } from '../data/animeData';

interface HeroBannerProps {
  featuredAnimes: Anime[];
  onSelectAnime: (animeId: string) => void;
  onWatchEpisode: (animeId: string, episodeId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredAnimes,
  onSelectAnime,
  onWatchEpisode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!featuredAnimes || featuredAnimes.length === 0) return null;

  const currentAnime = featuredAnimes[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredAnimes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredAnimes.length) % featuredAnimes.length);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-10 border border-gray-800 bg-[#0e111a] shadow-2xl group">
      {/* Background Image with Gradient Overlay */}
      <div className="relative h-[380px] sm:h-[440px] w-full">
        <img
          src={currentAnime.bannerImage}
          alt={currentAnime.title}
          className="w-full h-full object-cover object-center transition-all duration-700 transform scale-100 group-hover:scale-105"
        />
        {/* Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-[#0b0d14]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d14] via-[#0b0d14]/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/90 text-white text-xs font-bold tracking-wide uppercase shadow">
            <Flame className="w-3.5 h-3.5" /> Öne Çıkan Anime
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" /> {currentAnime.rating}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-gray-800/80 text-gray-300 text-xs font-semibold">
            {currentAnime.year}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
            {currentAnime.status}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-md">
          {currentAnime.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 italic mb-3">
          {currentAnime.japaneseTitle}
        </p>

        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 sm:line-clamp-3 mb-6 max-w-2xl leading-relaxed">
          {currentAnime.description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onWatchEpisode(
                currentAnime.id,
                currentAnime.episodes[0]?.id || `${currentAnime.id}-ep-1`
              )
            }
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-rose-950/40 hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Hemen İzle (Bölüm 1)
          </button>

          <button
            onClick={() => onSelectAnime(currentAnime.id)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-700 hover:border-gray-500 font-semibold text-sm transition-all"
          >
            <Info className="w-4 h-4 text-rose-400" />
            Detayları İncele
          </button>
        </div>
      </div>

      {/* Slide Navigation controls */}
      {featuredAnimes.length > 1 && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-gray-900/80 hover:bg-rose-600 text-white border border-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-gray-400 px-1">
            {currentIndex + 1} / {featuredAnimes.length}
          </span>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-gray-900/80 hover:bg-rose-600 text-white border border-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
