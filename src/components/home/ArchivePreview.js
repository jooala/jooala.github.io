import Link from 'next/link';
import { getProjects } from '../../lib/projects';
import useProjectFilters from '../projects/useProjectFilters';
import FilterBar from '../projects/FilterBar';
import { ArchiveCard } from '../projects/ArchiveCard';
import SectionHeader from '../ui/SectionHeader';
import Arrow from '../ui/Arrow';

const PREVIEW_COUNT = 9;

export default function ArchivePreview() {
  const projects = getProjects();
  const filters = useProjectFilters(projects);
  const shown = filters.results.slice(0, PREVIEW_COUNT);
  const key = `${filters.category}-${filters.sort}`;

  return (
    <div className="home-archive" aria-labelledby="archive-title">
      <SectionHeader id="archive-title" title="Project archive" />
      <FilterBar filters={filters} total={projects.length} idPrefix="home-archive" />

      <ul className="agrid agrid--home" key={key}>
        {shown.map((p, i) => (
          <ArchiveCard key={p.slug} project={p} style={{ '--i': i }} />
        ))}
      </ul>

      <Link href="/work/" className="home-archive__more">
        <span className="mono">Full archive</span>
        <span className="title">
          Index {String(1).padStart(3, '0')}–{String(projects.length).padStart(3, '0')}
        </span>
        <span className="home-archive__more-btn" aria-hidden="true">
          <Arrow size={16} />
        </span>
      </Link>
    </div>
  );
}
