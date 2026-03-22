import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useActiveSection, sections } from './useActiveSection';

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

      // Circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // Centre-crop to square then scale to canvas
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

export const useDynamicHead = () => {
  const { activeSection } = useActiveSection();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
    staleTime: 1000 * 60 * 5,
  });

  const s = settings as Record<string, string> | undefined;
  const heroImageUrl = s?.heroImageUrl ?? null;

  // Update <title> on every section change
  useEffect(() => {
    const section = sections.find(sec => sec.id === activeSection);
    const label = section?.label ?? 'Home';
    document.title = activeSection === 'hero'
      ? 'Bensidney Githu — Portfolio'
      : `${label} | Bensidney Githu`;
  }, [activeSection]);

  // Update favicon whenever heroImageUrl changes
  useEffect(() => {
    if (!heroImageUrl) {
      setFaviconHref('/favicon.svg');
      return;
    }
    buildCircularFavicon(heroImageUrl).then((dataUrl) => {
      setFaviconHref(dataUrl || '/favicon.svg');
    });
  }, [heroImageUrl]);
};
