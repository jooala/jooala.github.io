import { SORTS } from '../../lib/projects';

// Category tabs + optional search + sort. Purely presentational: state comes
// from useProjectFilters.
export default function FilterBar({
  filters,
  total,
  showSearch = false,
  showSort = true,
  idPrefix = 'filters',
}) {
  const { category, setCategory, query, setQuery, sort, setSort, categories, results } = filters;

  return (
    <div className="fbar">
      <div className="fbar__tabs" role="group" aria-label="Filter by category">
        <button
          type="button"
          className="fbar__tab mono"
          aria-pressed={category === 'all'}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className="fbar__tab mono"
            aria-pressed={category === c.id}
            onClick={() => setCategory(category === c.id ? 'all' : c.id)}
          >
            {c.label}
            <sup>{c.count}</sup>
          </button>
        ))}
      </div>

      <div className="fbar__tools">
        {showSearch && (
          <div className="fbar__search">
            <label htmlFor={`${idPrefix}-q`} className="sr-only">
              Search projects
            </label>
            <input
              id={`${idPrefix}-q`}
              type="search"
              className="mono"
              placeholder="Search: title, role, tool…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}
        {showSort && (
          <div className="fbar__sort">
            <label htmlFor={`${idPrefix}-sort`} className="mono">
              Sort:
            </label>
            <select
              id={`${idPrefix}-sort`}
              className="mono"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="fbar__count mono" aria-live="polite">
          {results.length === total
            ? `${String(total).padStart(2, '0')} projects`
            : `${String(results.length).padStart(2, '0')} / ${String(total).padStart(2, '0')} projects`}
        </p>
      </div>
    </div>
  );
}
