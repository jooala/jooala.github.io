import { PROJECTS, CATEGORIES } from '../content/projects.mjs';

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

// Attach derived fields once: number, display year, category labels, URL.
const ALL = PROJECTS.map((p, i) => ({
  ...p,
  index: i,
  no: String(i + 1).padStart(2, '0'),
  href: `/work/${p.slug}/`,
  yearLabel: p.year ?? p.status ?? null,
  categoryLabels: (p.categories || []).map((id) => CATEGORY_LABELS[id] || id),
  listed: p.listed !== false,
}));

export const TOTAL = ALL.length;

export function getProjects() {
  return ALL.filter((p) => p.listed);
}

export function getFeatured() {
  return ALL.filter((p) => p.listed && p.featured);
}

export function getProject(slug) {
  return ALL.find((p) => p.slug === slug) || null;
}

export function getAllSlugs() {
  return ALL.map((p) => p.slug);
}

// Previous / next among listed projects, wrapping around.
export function getAdjacent(slug) {
  const list = getProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

// Categories that have at least one listed project, with counts.
export function getCategoryCounts(list = getProjects()) {
  return CATEGORIES.map((c) => ({
    ...c,
    count: list.filter((p) => p.categories.includes(c.id)).length,
  })).filter((c) => c.count > 0);
}

export const SORTS = [
  { id: 'index', label: 'Index' },
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'title', label: 'A–Z' },
];

// Current/ongoing work sorts as newest; projects without a year go last.
function sortYear(p) {
  if (typeof p.year === 'number') return p.year;
  if (p.status) return 9999;
  return null;
}

export function filterProjects(list, { category = 'all', query = '', sort = 'index' } = {}) {
  const q = query.trim().toLowerCase();
  let out = list.filter((p) => {
    if (category !== 'all' && !p.categories.includes(category)) return false;
    if (!q) return true;
    const hay = [
      p.title, p.subtitle, p.summary, p.role, p.context, p.client,
      ...(p.categoryLabels || []), ...(p.tools || []), ...(p.highlights || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });

  if (sort === 'title') {
    out = [...out].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'newest' || sort === 'oldest') {
    const dir = sort === 'newest' ? -1 : 1;
    out = [...out].sort((a, b) => {
      const ya = sortYear(a);
      const yb = sortYear(b);
      if (ya === yb) return a.index - b.index;
      if (ya === null) return 1;
      if (yb === null) return -1;
      return (ya - yb) * dir;
    });
  }
  return out;
}
