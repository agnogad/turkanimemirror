import React, { useEffect, useState } from 'react';
import { fetchAniListMedia, slugToTitle } from '../services/api';
import { Film } from 'lucide-react';

interface AniListCoverProps {
  slug: string;
  className?: string;
  alt?: string;
}

export const AniListCover: React.FC<AniListCoverProps> = ({
  slug,
  className = 'w-full h-full object-cover',
  alt,
}) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    const title = slugToTitle(slug);
    fetchAniListMedia(title)
      .then((media) => {
        if (!isMounted) return;
        const url = media?.coverImage?.extraLarge || media?.coverImage?.large || null;
        if (url) {
          setCoverUrl(url);
        } else {
          setHasError(true);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#121212] animate-pulse flex items-center justify-center text-neutral-700">
        <Film className="w-6 h-6 opacity-30" />
      </div>
    );
  }

  if (hasError || !coverUrl) {
    return (
      <div className="w-full h-full bg-[#121212] flex flex-col items-center justify-center p-2 text-center text-neutral-600 font-mono text-[10px]">
        <Film className="w-6 h-6 mb-1 opacity-40" />
        <span className="truncate max-w-full px-1">{slugToTitle(slug)}</span>
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={alt || slugToTitle(slug)}
      className={className}
      loading="lazy"
    />
  );
};
