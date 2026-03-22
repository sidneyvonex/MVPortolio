import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const setFaviconHref = (href: string) => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
  link.type = href.startsWith('data:') ? 'image/png' : 'image/svg+xml';
};

const buildCircularFavicon = (src: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(''); return; }

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      const aspect = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (aspect > 1) { sx = (img.width - img.height) / 2; sw = img.height; }
      else            { sy = (img.height - img.width)  / 2; sh = img.width; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve('');
    img.src = src;
  });

/** Sets document.title and updates the favicon to a circular crop of the hero photo. */
export const useAdminHead = (title: string) => {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
    staleTime: 1000 * 60 * 5,
  });

  const s = settings as Record<string, string> | undefined;
  const heroImageUrl = s?.heroImageUrl ?? null;

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!heroImageUrl) { setFaviconHref('/favicon.svg'); return; }
    buildCircularFavicon(heroImageUrl).then((dataUrl) => {
      setFaviconHref(dataUrl || '/favicon.svg');
    });
  }, [heroImageUrl]);
};
