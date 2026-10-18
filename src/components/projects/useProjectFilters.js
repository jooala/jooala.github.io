import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { filterProjects, getCategoryCounts, SORTS } from '../../lib/projects';

const VALID_SORTS = SORTS.map((s) => s.id);

// Filter/search/sort state for a project list. With `syncUrl`, state is
// mirrored to ?category=&q=&sort= so filtered views can be shared.
export default function useProjectFilters(projects, { syncUrl = false } = {}) {
  const router = useRouter();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('index');

  // Read initial state from the URL once the static page has hydrated
  useEffect(() => {
    if (!syncUrl || !router.isReady) return;
    const { category: c, q, sort: s } = router.query;
    if (typeof c === 'string') setCategory(c);
    if (typeof q === 'string') setQuery(q);
    if (typeof s === 'string' && VALID_SORTS.includes(s)) setSort(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl, router.isReady]);

  useEffect(() => {
    if (!syncUrl || !router.isReady) return undefined;
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (query.trim()) params.set('q', query.trim());
      if (sort !== 'index') params.set('sort', sort);
      const qs = params.toString();
      const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
      if (next !== `${window.location.pathname}${window.location.search}`) {
        window.history.replaceState(window.history.state, '', next);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [syncUrl, router.isReady, category, query, sort]);

  const categories = useMemo(() => getCategoryCounts(projects), [projects]);
  const results = useMemo(
    () => filterProjects(projects, { category, query, sort }),
    [projects, category, query, sort]
  );

  const reset = () => {
    setCategory('all');
    setQuery('');
    setSort('index');
  };

  return { category, setCategory, query, setQuery, sort, setSort, categories, results, reset };
}
