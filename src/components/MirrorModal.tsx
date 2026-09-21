import React, { useState } from 'react';
import { Globe, Copy, Check, ExternalLink, X, ShieldCheck, HardDrive, Wifi } from 'lucide-react';
import { MIRROR_LINKS } from './MirrorNoticeBar';

interface MirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MirrorModal: React.FC<MirrorModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      setCacheStatus('Önbellek başarıyla temizlendi! Sayfa yenileniyor...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full p-6 relative shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#171717] border border-[#262626] flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Yedek Ayna & Çevrimdışı Sistemi</h2>
              <p className="text-xs text-neutral-400 font-mono">TurkAnimeMirror Kesintisiz Erişim</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-3 text-xs leading-relaxed text-neutral-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
            <ShieldCheck className="w-4 h-4" /> Otomatik Önbellekleme & Ayna Desteği
          </div>
          <p>
            Ana domaine ulaşılamadığı veya internetiniz kesildiği durumlarda TurkAnimeMirror Service Worker önbelleği ve yedek mirror sunucuları devreye girer.
          </p>
        </div>

        {/* Mirror Links List */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-blue-400" /> Aktif Mirror Adresleri
          </h3>

          <div className="space-y-2">
            {MIRROR_LINKS.map((mirror) => (
              <div
                key={mirror.url}
                className="bg-[#121212] border border-[#262626] hover:border-neutral-500 rounded-lg p-3 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{mirror.name}</span>
                    <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60 px-1.5 py-0.2 rounded">
                      {mirror.badge}
                    </span>
                  </div>
                  <a
                    href={mirror.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-blue-400 hover:underline truncate block mt-1"
                  >
                    {mirror.url}
                  </a>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(mirror.url)}
                    className="px-2.5 py-1.5 bg-[#1f1f1f] hover:bg-neutral-700 text-neutral-200 text-xs font-mono rounded flex items-center gap-1 transition-colors"
                  >
                    {copiedUrl === mirror.url ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Kopyala
                      </>
                    )}
                  </button>

                  <a
                    href={mirror.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white text-black hover:bg-neutral-200 rounded transition-colors"
                    title="Aç"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cache Controls */}
        <div className="pt-4 border-t border-[#1f1f1f] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <HardDrive className="w-4 h-4 text-neutral-500" />
            <span>Service Worker: <strong className="text-emerald-400">Aktif</strong></span>
          </div>

          <button
            onClick={handleClearCache}
            className="text-xs font-mono text-neutral-400 hover:text-rose-400 hover:underline"
          >
            Önbelleği Temizle
          </button>
        </div>

        {cacheStatus && (
          <p className="text-xs font-mono text-emerald-400 text-center bg-emerald-950/40 border border-emerald-900/60 p-2 rounded">
            {cacheStatus}
          </p>
        )}
      </div>
    </div>
  );
};
