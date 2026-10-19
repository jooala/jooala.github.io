import { PROJECTS, CATEGORIES, FEATURED_ORDER } from '../content/projects.mjs';

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

// Attach derived fields once: number, display year, category labels, URL.
// Listed projects are numbered in order; unlisted ones are numbered after them.
const ORDER = [...PROJECTS.filter((p) => p.listed !== false), ...PROJECTS.filter((p) => p.listed === false)];

const ALL = PROJECTS.map((p, i) => ({
  ...p,
  index: i,
  no: String(ORDER.indexOf(p) + 1).padStart(2, '0'),
  href: `/work/${p.slug}/`,
  yearLabel: p.year ?? p.status ?? null,
  categoryLabels: (p.categories || []).map((id) => CATEGORY_LABELS[id] || id),
  listed: p.listed !== false,
}));

export const TOTAL = ALL.length;

export function getProjects() {
  return ALL.filter((p) => p.listed);
}

// In FEATURED_ORDER first, then any other featured projects in project order
export function getFeatured() {
  const rank = (p) => {
    const i = FEATURED_ORDER.indexOf(p.slug);
    return i === -1 ? FEATURED_ORDER.length + p.index : i;
  };
  return ALL.filter((p) => p.listed && p.featured).sort((a, b) => rank(a) - rank(b));
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

export function filterProjects(list, { category = 'all', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return list.filter((p) => {
    if (category !== 'all' && !p.categories.includes(category)) return false;
    if (!q) return true;
    const hay = [
      p.title, p.subtitle, p.summary, p.role, p.context, p.client,
      ...(p.categoryLabels || []), ...(p.tools || []), ...(p.highlights || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });
}
