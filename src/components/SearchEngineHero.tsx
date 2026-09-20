import React from 'react';
import { ArrowRight, Film } from 'lucide-react';

interface SearchEngineHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: string[];
  isLoading: boolean;
  onSelectAnime: (slug: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const POPULAR_SEARCHES = [
  { slug: 'solo-leveling', title: 'Solo Leveling' },
  { slug: 'jujutsu-kaisen-s2', title: 'Jujutsu Kaisen 2' },
  { slug: 'demon-slayer-hashira', title: 'Demon Slayer: Hashira' },
  { slug: 'sousou-no-frieren', title: 'Sousou no Frieren' },
  { slug: 'shingeki-no-kyojin', title: 'Attack on Titan' },
  { slug: 'chainsaw-man', title: 'Chainsaw Man' },
  { slug: 'naruto-shippuuden', title: 'Naruto Shippuuden' },
  { slug: 'one-piece', title: 'One Piece' }
];

export const SearchEngineHero: React.FC<SearchEngineHeroProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isLoading,
  onSelectAnime,
  searchInputRef,
}) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative px-4 py-12 bg-vercel-grid">
      
      {/* Vercel Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Content */}
      <div className="w-full max-w-2xl mx-auto text-center space-y-6 relative z-10">
        
        {/* Vercel Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#262626] text-xs font-mono text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          TurkAnimeTV Arşiv Engine • Vercel Architecture
        </div>

        {/* Big Search Title */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
            <span className="text-white">TURK</span>
            <span className="text-neutral-300">
              ANIME
            </span>
            <span className="text-xs font-mono text-neutral-500 border border-neutral-800 px-2 py-1 rounded">
              v2.0
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
            Türkiye'nin Vercel estetiğinde minimalist ve kesintisiz anime arama motoru
          </p>
        </div>

        {/* Screen-Centered Search Engine Input Box */}
        <div className="relative w-full max-w-2xl mx-auto mt-6">
          <div className="relative flex items-center bg-[#0a0a0a] border border-[#262626] focus-within:border-white rounded-lg p-2.5 transition-all shadow-2xl">
            <span className="text-neutral-500 font-mono text-sm ml-2.5 mr-1">/</span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Anime ismi ara (örn: Solo Leveling, Naruto, Jujutsu Kaisen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 pl-2 pr-10 py-1.5 focus:outline-none font-sans"
              autoFocus
            />

            {isLoading && (
              <span className="w-4 h-4 text-neutral-400 animate-spin mr-2">◌</span>
            )}

            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded text-neutral-400 hover:text-white mr-1 text-xs font-mono"
                title="Temizle"
              >
                [ESC]
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-neutral-500 bg-[#171717] px-2 py-1 rounded border border-[#262626] mr-1">
                Cmd+K
              </div>
            )}
          </div>

          {/* Quick Filter Info Tag */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 px-1 mt-2">
            <span>
              {searchQuery.trim()
                ? `${searchResults.length} Sonuç Bulundu`
                : 'Aramak istediğiniz anime adını yazın veya hızlı etiketlere tıklayın'}
            </span>
            <span className="hidden sm:inline">Bas: [Enter] veya [Tıkla]</span>
          </div>
        </div>

        {/* Popular Trending Search Pills */}
        <div className="pt-2">
          <p className="text-[11px] font-mono text-neutral-500 mb-2 uppercase tracking-wider">
            Popüler Aramalar
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl mx-auto">
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item.slug}
                onClick={() => onSelectAnime(item.slug)}
                className="px-3 py-1 rounded-md bg-[#0a0a0a] hover:bg-white hover:text-black border border-[#262626] text-xs font-medium text-neutral-300 transition-all flex items-center gap-1.5"
              >
                <span>{item.title}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Real-time Search Results Grid */}
      {searchQuery.trim() !== '' && (
        <div className="w-full max-w-4xl mx-auto mt-10 relative z-20">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-5 shadow-2xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 pb-2 border-b border-[#1f1f1f] flex items-center justify-between">
              <span>Arama Sonuçları ("{searchQuery}")</span>
              <span>{searchResults.length} Eşleşme</span>
            </h3>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {searchResults.slice(0, 12).map((slug) => {
                  return (
                    <div
                      key={slug}
                      onClick={() => onSelectAnime(slug)}
                      className="p-3.5 rounded-lg bg-[#121212] border border-[#1f1f1f] hover:border-neutral-500 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-bold text-neutral-400 group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                          <Film className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white group-hover:text-neutral-200 truncate">
                          {slug}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-neutral-500">
                "{searchQuery}" ile eşleşen anime bulunamadı.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
