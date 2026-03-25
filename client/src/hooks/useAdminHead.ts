import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { setFaviconHref, buildCircularFavicon } from '../lib/favicon';

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
