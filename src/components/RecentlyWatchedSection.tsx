import React from 'react';
import { History, Play, Trash2, Clock, ChevronRight } from 'lucide-react';
import type { WatchHistoryItem } from '../utils/storage';
import { clearWatchHistory, removeHistoryItem } from '../utils/storage';

interface RecentlyWatchedProps {
  history: WatchHistoryItem[];
  onHistoryUpdate: () => void;
  onWatchEpisode: (animeSlug: string, episodeSlug: string) => void;
  onNavigateHistoryPage?: () => void;
}

export const RecentlyWatchedSection: React.FC<RecentlyWatchedProps> = ({
  history,
  onHistoryUpdate,
  onWatchEpisode,
  onNavigateHistoryPage,
}) => {
  if (!history || history.length === 0) return null;

  const handleClearAll = () => {
    if (window.confirm('Tüm izleme geçmişinizi silmek istediğinize emin misiniz?')) {
      clearWatchHistory();
      onHistoryUpdate();
    }
  };

  const handleRemoveSingle = (e: React.MouseEvent, item: WatchHistoryItem) => {
    e.stopPropagation();
    removeHistoryItem(item.animeId, item.episodeId);
    onHistoryUpdate();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-sm">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Son İzlenenler
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  {history.length} Kayıt
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Kaldığınız dakikadan anında devam edin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateHistoryPage && (
              <button
                onClick={onNavigateHistoryPage}
                className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-[#171717] border border-[#262626] transition-colors"
              title="Temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Temizle
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {history.slice(0, 4).map((item) => {
            const percentage = item.totalSeconds
              ? Math.min(100, Math.round((item.progressSeconds / item.totalSeconds) * 100))
              : 0;

            const minutesLeft = Math.max(
              1,
              Math.ceil((item.totalSeconds - item.progressSeconds) / 60)
            );

            return (
              <div
                key={`${item.animeId}-${item.episodeId}`}
                onClick={() => onWatchEpisode(item.animeId, item.episodeId)}
                className="group relative bg-[#121212] rounded-lg border border-[#1f1f1f] hover:border-neutral-500 transition-all p-4 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold">
                      {item.episodeNumber}. Bölüm
                    </span>
                    <button
                      onClick={(e) => handleRemoveSingle(e, item)}
                      className="p-1 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-neutral-200 truncate">
                    {item.animeTitle}
                  </h4>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-400 font-mono">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <span>{minutesLeft} dk kaldı</span>
                    <span>•</span>
                    <span>%{percentage}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
                  <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-white h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <button className="w-full py-1.5 rounded bg-white text-black group-hover:bg-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                    <Play className="w-3.5 h-3.5 fill-black" />
                    Devam Et
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
