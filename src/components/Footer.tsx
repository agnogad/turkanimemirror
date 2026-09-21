import React from 'react';
import { Heart, Globe, ExternalLink } from 'lucide-react';
import { MIRROR_LINKS } from './MirrorNoticeBar';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenMirrorModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenMirrorModal }) => {
  return (
    <footer className="bg-[#000000] border-t border-[#1f1f1f] text-neutral-400 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-2 md:col-span-1">
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-6 h-6 bg-white text-black flex items-center justify-center font-extrabold text-xs rounded-sm">
                ▲
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                TurkAnime<span className="text-neutral-400 font-normal">Mirror</span>
              </span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Vercel estetiğinde minimalist, kesintisiz ve hızlı Türkçe anime arama motoru.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>TurkAnimeTV Arşiv API & Önbellek Bağlı</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider mb-3">
              Gezinti
            </h4>
            <ul className="space-y-2 text-[11px] font-mono">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Arama Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('all-animes')}
                  className="hover:text-white transition-colors"
                >
                  Tüm Animeler Katalogu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-white transition-colors"
                >
                  Son İzlenenler
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('favorites')}
                  className="hover:text-white transition-colors"
                >
                  Favorilerim
                </button>
              </li>
            </ul>
          </div>

          {/* Mirror Links Notice Column */}
          <div>
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Mirror (Ayna) Linkleri
            </h4>
            <ul className="space-y-2 text-[11px] font-mono">
              {MIRROR_LINKS.map((mirror) => (
                <li key={mirror.url}>
                  <a
                    href={mirror.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline truncate"
                  >
                    <span>{mirror.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </li>
              ))}
              {onOpenMirrorModal && (
                <li className="pt-1">
                  <button
                    onClick={onOpenMirrorModal}
                    className="text-neutral-300 hover:text-white underline text-[11px]"
                  >
                    Ayna & Çevrimdışı Detayları
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider mb-3">
              Yasal Uyarı
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              TurkAnimeMirror sunucularında hiçbir video barındırılmaz. Tüm videolar 3. taraf video sağlayıcılarından iframe embed ile sunulmaktadır.
            </p>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 text-[11px] font-mono">
          <p>© {new Date().getFullYear()} TurkAnimeMirror. Tüm hakları saklıdır.</p>
          <p className="flex items-center gap-1">
            Vercel Craft ile tasarlandı <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
