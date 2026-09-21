import React, { useState } from 'react';
import { Globe, Copy, Check, ExternalLink, X, ShieldCheck } from 'lucide-react';

export const MIRROR_LINKS = [
  {
    name: 'Surge Mirror',
    url: 'https://turkanimemirror.surge.sh/',
    badge: 'Aktif / Hızlı',
  },
  {
    name: 'Netlify Mirror',
    url: 'https://turkanimemirror.netlify.app/',
    badge: 'Yedek / CDN',
  },
];

export const MirrorNoticeBar: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (isDismissed) return null;

  return (
    <div className="bg-[#0f141d] border-b border-blue-900/40 px-4 py-2.5 text-xs text-neutral-300 w-full relative">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Left Side Info */}
        <div className="flex items-center gap-2 text-white font-medium shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <Globe className="w-4 h-4 text-blue-400" />
          <span className="font-semibold tracking-wide">Yedek Ayna (Mirror) Adresleri:</span>
          <span className="hidden lg:inline text-neutral-400 font-normal">
            Site çökmesi veya erişim engelinde bu adresleri kullanabilirsiniz.
          </span>
        </div>

        {/* Center: Mirror Links */}
        <div className="flex items-center gap-3 flex-wrap justify-center font-mono">
          {MIRROR_LINKS.map((mirror) => (
            <div
              key={mirror.url}
              className="flex items-center gap-1.5 bg-[#07090e] border border-blue-900/50 hover:border-blue-500/60 rounded px-2.5 py-1 text-[11px] transition-all group"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <a
                href={mirror.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-white flex items-center gap-1 hover:underline"
              >
                <span>{mirror.name}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100" />
              </a>

              <button
                onClick={() => handleCopy(mirror.url)}
                title="Link kopyala"
                className="ml-1 text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
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

        {/* Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition-colors shrink-0"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
