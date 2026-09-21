import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Copy, Check, ExternalLink, HardDriveDownload } from 'lucide-react';
import { MIRROR_LINKS } from './MirrorNoticeBar';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (isOnline) return null;

  return (
    <div className="bg-rose-950/90 border-b border-rose-700/50 text-white px-4 py-3 text-xs w-full shadow-lg backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Warning Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-rose-900/80 rounded-full border border-rose-500/50">
            <WifiOff className="w-4 h-4 text-rose-200 animate-pulse" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2 text-rose-100">
              <span>Çevrimdışı Mod Aktif</span>
              <span className="bg-rose-900 text-rose-300 font-mono text-[10px] px-2 py-0.5 rounded border border-rose-700 flex items-center gap-1">
                <HardDriveDownload className="w-3 h-3" /> Önbellekten Çalışıyor
              </span>
            </div>
            <p className="text-[11px] text-rose-200/80 mt-0.5">
              İnternet bağlantınız koptu veya sunucu yanıt vermiyor. Önceden yüklenmiş veriler gösterilmektedir.
            </p>
          </div>
        </div>

        {/* Mirror Links & Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 border border-rose-600 rounded font-mono text-xs flex items-center gap-1.5 text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Yeniden Dene
          </button>

          {MIRROR_LINKS.map((mirror) => (
            <div
              key={mirror.url}
              className="flex items-center gap-1.5 bg-black/40 border border-rose-800/80 rounded px-2.5 py-1 text-[11px]"
            >
              <a
                href={mirror.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-200 hover:text-white font-mono flex items-center gap-1"
              >
                <span>{mirror.name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleCopy(mirror.url)}
                className="text-rose-300 hover:text-white p-0.5 transition-colors"
                title="Kopyala"
              >
                {copiedUrl === mirror.url ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
