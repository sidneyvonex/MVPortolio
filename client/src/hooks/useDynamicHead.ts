import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useActiveSection, sections } from './useActiveSection';
import { setFaviconHref, buildCircularFavicon } from '../lib/favicon';

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
