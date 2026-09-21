import React from 'react';
import { Search, Heart, History, Film, Command, Globe } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onFocusSearch: () => void;
  onOpenMirrorModal?: () => void;
  animeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onFocusSearch,
  onOpenMirrorModal,
  animeCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-[#1f1f1f] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
          
          {/* Vercel Style Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0 min-w-0"
          >
            <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-extrabold text-sm rounded-sm group-hover:bg-neutral-200 transition-colors shadow-sm shrink-0">
              ▲
            </div>
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-neutral-300 transition-colors truncate">
              TurkAnime<span className="text-neutral-400 font-normal">Mirror</span>
            </span>
          </div>

          {/* Quick Search Trigger Input Button */}
          <button
            onClick={onFocusSearch}
            className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-md bg-[#0a0a0a] border border-[#262626] hover:border-[#404040] text-xs text-neutral-400 hover:text-white transition-all max-w-sm w-full"
          >
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span className="flex-1 text-left truncate">
              Anime veya bölüm ara...
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px] text-neutral-500 bg-[#171717] px-1.5 py-0.5 rounded border border-[#262626]">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-neutral-900 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Arama</span>
            </button>

            <button
              onClick={() => onNavigate('all-animes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentView === 'all-animes'
                  ? 'bg-neutral-900 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Katalog</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentView === 'history'
                  ? 'bg-neutral-900 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>İzlenenler</span>
            </button>

            <button
              onClick={() => onNavigate('favorites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentView === 'favorites'
                  ? 'bg-neutral-900 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Favoriler</span>
            </button>
          </nav>

          {/* API Status & Mirror Badge */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#1f1f1f] text-[11px] font-mono shrink-0">
            {onOpenMirrorModal && (
              <button
                onClick={onOpenMirrorModal}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-[#0f141d] border border-blue-900/50 hover:border-blue-500 text-blue-300 hover:text-white transition-colors"
                title="Mirror (Yedek) Linkleri"
              >
                <Globe className="w-3 h-3 text-blue-400" />
                <span>Aynalar</span>
              </button>
            )}
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-neutral-400">
              {animeCount > 0 ? `${animeCount} Anime` : 'API Online'}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};
