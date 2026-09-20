import React from 'react';
import { Star, Play, Heart } from 'lucide-react';
import type { Anime } from '../data/animeData';

interface AnimeCardProps {
  anime: Anime;
  isFavorite: boolean;
  onSelectAnime: (id: string) => void;
  onWatchEpisode: (animeId: string, episodeId: string) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  isFavorite,
  onSelectAnime,
  onWatchEpisode,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={() => onSelectAnime(anime.id)}
      className="group relative bg-[#121520] rounded-xl border border-gray-800/80 hover:border-rose-500/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col shadow-lg hover:shadow-2xl hover:shadow-rose-950/20"
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-950">
        <img
          src={anime.coverImage}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Dark gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-transparent to-black/30 group-hover:via-black/40 transition-colors" />

        {/* Favorite Button */}
        <button
          onClick={(e) => onToggleFavorite(e, anime.id)}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-transform duration-300 ${
            isFavorite
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-black/60 text-gray-300 hover:text-rose-400 hover:scale-110'
          }`}
          title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Rating Badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1 border border-amber-500/20 shadow">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{anime.rating}</span>
        </div>

        {/* Play Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatchEpisode(
                anime.id,
                anime.episodes[0]?.id || `${anime.id}-ep-1`
              );
            }}
            className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform hover:bg-rose-500"
            title="Bölüm 1'i İzle"
          >
            <Play className="w-6 h-6 ml-0.5 fill-white" />
          </button>
        </div>

        {/* Episode count badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-gray-200">
          <span className="px-2 py-0.5 rounded bg-gray-900/80 border border-gray-700/60 backdrop-blur-sm">
            {anime.episodesCount} Bölüm
          </span>
          <span
            className={`px-2 py-0.5 rounded backdrop-blur-sm ${
              anime.status === 'Devam Ediyor'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            {anime.status}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
            {anime.title}
          </h3>
          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            {anime.japaneseTitle}
          </p>
        </div>

        {/* Genres tag */}
        <div className="flex flex-wrap gap-1 mt-3">
          {anime.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-[10px] px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800"
            >
              {genre}
            </span>
          ))}
          {anime.genres.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800">
              +{anime.genres.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
