import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { filterProjects, getCategoryCounts } from '../../lib/projects';

// Filter/search state for a project list. With `syncUrl`, state is
// mirrored to ?category=&q= so filtered views can be shared.
export default function useProjectFilters(projects, { syncUrl = false } = {}) {
  const router = useRouter();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  // Read initial state from the URL once the static page has hydrated
  useEffect(() => {
    if (!syncUrl || !router.isReady) return;
    const { category: c, q } = router.query;
    if (typeof c === 'string') setCategory(c);
    if (typeof q === 'string') setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl, router.isReady]);

  useEffect(() => {
    if (!syncUrl || !router.isReady) return undefined;
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (query.trim()) params.set('q', query.trim());
      const qs = params.toString();
      const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
      if (next !== `${window.location.pathname}${window.location.search}`) {
        window.history.replaceState(window.history.state, '', next);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [syncUrl, router.isReady, category, query]);

  const categories = useMemo(() => getCategoryCounts(projects), [projects]);
  const results = useMemo(
    () => filterProjects(projects, { category, query }),
    [projects, category, query]
  );

  const reset = () => {
    setCategory('all');
    setQuery('');
  };

  return { category, setCategory, query, setQuery, categories, results, reset };
}
