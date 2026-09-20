import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SearchEngineHero } from './components/SearchEngineHero';
import { RecentlyWatchedSection } from './components/RecentlyWatchedSection';
import { AnimeDetail } from './components/AnimeDetail';
import { WatchPlayer } from './components/WatchPlayer';
import { Footer } from './components/Footer';
import { fetchAnimeList, slugToTitle } from './services/api';
import { getWatchHistory, getFavorites, toggleFavorite, clearWatchHistory } from './utils/storage';
import type { WatchHistoryItem } from './utils/storage';
import { Film, Heart, History, Trash2, Play, Loader2 } from 'lucide-react';

export function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'detail' | 'watch' | 'all-animes' | 'history' | 'favorites'>('home');
  const [selectedAnimeSlug, setSelectedAnimeSlug] = useState<string>('solo-leveling');
  const [selectedEpisodeSlug, setSelectedEpisodeSlug] = useState<string>('solo-leveling-ep-1');

  // API Data & Search State
  const [allAnimeSlugs, setAllAnimeSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Pagination for Catalog View
  const [catalogPage, setCatalogPage] = useState(1);
  const ITEMS_PER_PAGE = 36;

  // Storage State
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Ref for screen-centered search input focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch all anime slugs on boot
  useEffect(() => {
    fetchAnimeList().then((slugs) => {
      setAllAnimeSlugs(slugs);
      setIsLoadingList(false);
    });
    refreshStorageState();
  }, []);

  const refreshStorageState = () => {
    setHistory(getWatchHistory());
    setFavorites(getFavorites());
  };

  // Filter search results
  const searchResults = searchQuery.trim()
    ? allAnimeSlugs.filter((slug) =>
        slug.toLowerCase().includes(searchQuery.toLowerCase().replace(/\s+/g, '-')) ||
        slugToTitle(slug).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleNavigate = (view: string) => {
    setCurrentView(view as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAnime = (slug: string) => {
    setSelectedAnimeSlug(slug);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWatchEpisode = (animeSlug: string, episodeSlug: string) => {
    setSelectedAnimeSlug(animeSlug);
    setSelectedEpisodeSlug(episodeSlug);
    setCurrentView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFav = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    const updated = toggleFavorite(slug);
    setFavorites(updated);
  };

  const handleFocusSearch = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      searchInputRef.current?.focus();
    }
  };

  // Filtered Catalog Animes
  const catalogFilteredSlugs = searchQuery.trim()
    ? searchResults
    : allAnimeSlugs;

  const totalCatalogPages = Math.ceil(catalogFilteredSlugs.length / ITEMS_PER_PAGE);
  const currentCatalogSlugs = catalogFilteredSlugs.slice(
    (catalogPage - 1) * ITEMS_PER_PAGE,
    catalogPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed] font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onFocusSearch={handleFocusSearch}
        animeCount={allAnimeSlugs.length}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        
        {/* VIEW: HOME / SEARCH ENGINE */}
        {currentView === 'home' && (
          <div>
            {/* Screen-Centered Search Engine Hero */}
            <SearchEngineHero
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              isLoading={isLoadingList}
              onSelectAnime={handleSelectAnime}
              searchInputRef={searchInputRef}
            />

            {/* SON İZLENENLER (RECENTLY WATCHED) */}
            <RecentlyWatchedSection
              history={history}
              onHistoryUpdate={refreshStorageState}
              onWatchEpisode={handleWatchEpisode}
              onNavigateHistoryPage={() => handleNavigate('history')}
            />
          </div>
        )}

        {/* VIEW: ANIME DETAIL */}
        {currentView === 'detail' && (
          <AnimeDetail
            slug={selectedAnimeSlug}
            isFavorite={favorites.includes(selectedAnimeSlug)}
            history={history}
            onToggleFavorite={handleToggleFav}
            onWatchEpisode={handleWatchEpisode}
            onBack={() => handleNavigate('home')}
          />
        )}

        {/* VIEW: WATCH PLAYER */}
        {currentView === 'watch' && (
          <WatchPlayer
            animeSlug={selectedAnimeSlug}
            episodeSlug={selectedEpisodeSlug}
            history={history}
            isFavorite={favorites.includes(selectedAnimeSlug)}
            onSelectAnime={handleSelectAnime}
            onSelectEpisode={handleWatchEpisode}
            onToggleFavorite={handleToggleFav}
            onBack={() => handleNavigate('detail')}
            onHistoryUpdate={refreshStorageState}
          />
        )}

        {/* VIEW: ALL ANIMES CATALOG */}
        {currentView === 'all-animes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#1f1f1f]">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Film className="w-6 h-6 text-white" /> Tüm Animeler Kataloğu
                </h1>
                <p className="text-xs font-mono text-neutral-400 mt-1">
                  TurkAnimeTV Arşivindeki tüm {allAnimeSlugs.length} anime başlığı
                </p>
              </div>
            </div>

            {/* Catalog Grid */}
            {isLoadingList ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
                <p className="text-xs font-mono text-neutral-400">Katalog verileri yükleniyor...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {currentCatalogSlugs.map((slug) => {
                    const title = slugToTitle(slug);
                    return (
                      <div
                        key={slug}
                        onClick={() => handleSelectAnime(slug)}
                        className="p-4 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] hover:border-white transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center text-xs font-mono font-bold mb-3 group-hover:bg-white group-hover:text-black transition-colors">
                            ▲
                          </div>
                          <h3 className="text-xs font-bold text-white group-hover:text-neutral-200 line-clamp-2">
                            {title}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 mt-3 block truncate">
                          slug: {slug}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalCatalogPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-[#1f1f1f] pt-4 font-mono text-xs text-neutral-400">
                    <button
                      disabled={catalogPage === 1}
                      onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded bg-[#0a0a0a] border border-[#262626] hover:border-neutral-500 disabled:opacity-30 text-white"
                    >
                      ← Önceki Sayfa
                    </button>

                    <span>
                      Sayfa {catalogPage} / {totalCatalogPages}
                    </span>

                    <button
                      disabled={catalogPage === totalCatalogPages}
                      onClick={() => setCatalogPage((p) => Math.min(totalCatalogPages, p + 1))}
                      className="px-3 py-1.5 rounded bg-[#0a0a0a] border border-[#262626] hover:border-neutral-500 disabled:opacity-30 text-white"
                    >
                      Sonraki Sayfa →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* VIEW: HISTORY */}
        {currentView === 'history' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1f1f1f]">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-white" /> Son İzlenenler Geçmişi
                </h1>
                <p className="text-xs font-mono text-neutral-400 mt-1">
                  Kaldığınız dakikadan anında izlemeye devam edin ({history.length} Kayıt)
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Tüm izleme geçmişini silmek istediğinize emin misiniz?')) {
                      clearWatchHistory();
                      refreshStorageState();
                    }
                  }}
                  className="px-3 py-1.5 rounded bg-[#0a0a0a] hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono border border-[#262626] flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Tümünü Sil
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item) => {
                  const percentage = item.totalSeconds
                    ? Math.min(100, Math.round((item.progressSeconds / item.totalSeconds) * 100))
                    : 0;

                  return (
                    <div
                      key={`${item.animeId}-${item.episodeId}`}
                      onClick={() => handleWatchEpisode(item.animeId, item.episodeId)}
                      className="group bg-[#0a0a0a] border border-[#1f1f1f] hover:border-white rounded-lg p-4 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-white font-bold">
                            {item.episodeNumber}. Bölüm
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            %{percentage}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-neutral-200 truncate">
                          {item.animeTitle}
                        </h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
                        <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden mb-3">
                          <div
                            className="bg-white h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <button className="w-full py-1.5 rounded bg-white text-black font-mono text-xs font-bold flex items-center justify-center gap-1.5">
                          <Play className="w-3.5 h-3.5 fill-black" /> İzlemeye Devam Et
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#0a0a0a] rounded-lg border border-[#1f1f1f] max-w-md mx-auto">
                <History className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">İzleme Geçmişiniz Boş</h3>
                <p className="text-xs font-mono text-neutral-400 mt-1 mb-4">
                  İzlediğiniz bölümler burada listelenecektir.
                </p>
                <button
                  onClick={() => handleNavigate('home')}
                  className="px-4 py-2 rounded bg-white text-black font-bold text-xs"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: FAVORITES */}
        {currentView === 'favorites' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 pb-4 border-b border-[#1f1f1f]">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Favori Animelerim
              </h1>
              <p className="text-xs font-mono text-neutral-400 mt-1">
                Favorilerinize eklediğiniz animeler ({favorites.length} Anime)
              </p>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {favorites.map((slug) => {
                  const title = slugToTitle(slug);
                  return (
                    <div
                      key={slug}
                      onClick={() => handleSelectAnime(slug)}
                      className="p-4 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] hover:border-white transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 text-rose-500 flex items-center justify-center text-xs font-mono font-bold mb-3">
                          <Heart className="w-4 h-4 fill-rose-500" />
                        </div>
                        <h3 className="text-xs font-bold text-white group-hover:text-neutral-200 line-clamp-2">
                          {title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 mt-3 block truncate">
                        slug: {slug}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#0a0a0a] rounded-lg border border-[#1f1f1f] max-w-md mx-auto">
                <Heart className="w-10 h-10 text-rose-500/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Favori Animeleriniz Yok</h3>
                <p className="text-xs font-mono text-neutral-400 mt-1 mb-4">
                  Animelerin detay sayfalarındaki kalp butonuna tıklayarak favorilerinize ekleyebilirsiniz.
                </p>
                <button
                  onClick={() => handleNavigate('home')}
                  className="px-4 py-2 rounded bg-white text-black font-bold text-xs"
                >
                  Animeleri Keşfet
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
