import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import FilterBar from '../../components/projects/FilterBar';
import useProjectFilters from '../../components/projects/useProjectFilters';
import { ArchiveCard, ArchiveRow } from '../../components/projects/ArchiveCard';
import { getProjects, getFeatured, getCategoryCounts } from '../../lib/projects';

const VIEWS = [
  { id: 'grid', label: 'Grid' },
  { id: 'index', label: 'Index' },
];

export default function WorkIndex() {
  const projects = getProjects();
  const filters = useProjectFilters(projects, { syncUrl: true });
  const [view, setView] = useState('grid');
  const { results } = filters;
  const total = projects.length;
  const pad = (n, l = 3) => String(n).padStart(l, '0');
  const listKey = `${view}-${filters.category}-${filters.sort}-${filters.query}`;

  return (
    <Layout
      seo={{
        title: 'Work: Project archive',
        description: `An index of ${total} projects by Joonas Alanenpää: product management, UX/UI, games, VR and development work.`,
        path: '/work/',
      }}
    >
      <header className="page-head wrap">
        <p className="page-head__kicker mono">
          <span>[02] Archive</span>
          <span>Index {pad(1)}–{pad(total)}</span>
        </p>
        <div className="page-head__grid">
          <h1 className="page-head__title display ink">
            Project
            <br />
            archive
          </h1>
          <div className="page-head__aside">
            <p className="page-head__count display" aria-hidden="true">
              {pad(total, 2)}
            </p>
            <dl className="page-head__stats mono">
              <div>
                <dt>Projects</dt>
                <dd>{total}</dd>
              </div>
              <div>
                <dt>Featured</dt>
                <dd>{getFeatured().length}</dd>
              </div>
              <div>
                <dt>Disciplines</dt>
                <dd>{getCategoryCounts().length}</dd>
              </div>
            </dl>
            <p className="page-head__intro">
              Everything in one place: product work, interface design, games, VR and development. Filter by
              discipline, search by tool or role, or switch to the index view.
            </p>
          </div>
        </div>
      </header>

      <section className="archive wrap" aria-label="Projects">
        <div className="archive__bar">
          <FilterBar filters={filters} total={total} showSearch idPrefix="archive" />
          <div className="archive__views" role="group" aria-label="View">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                className="fbar__tab mono"
                aria-pressed={view === v.id}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="archive__empty">
            <p className="display">No matches</p>
            <p>Nothing matches that search and filter combination.</p>
            <button type="button" className="pill-link" onClick={filters.reset}>
              <span className="pill-link__dot" aria-hidden="true">×</span>
              <span className="mono">Clear filters</span>
            </button>
          </div>
        ) : view === 'grid' ? (
          <ul className="agrid agrid--full" key={listKey}>
            {results.map((p, i) => (
              <ArchiveCard key={p.slug} project={p} style={{ '--i': i }} showFlag />
            ))}
          </ul>
        ) : (
          <ol className="alist" key={listKey}>
            {results.map((p, i) => (
              <ArchiveRow key={p.slug} project={p} style={{ '--i': i }} />
            ))}
          </ol>
        )}
      </section>
    </Layout>
  );
}
