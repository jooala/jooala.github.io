import { getProjects } from '../../lib/projects';
import useProjectFilters from '../projects/useProjectFilters';
import FilterBar from '../projects/FilterBar';
import { ArchiveCard } from '../projects/ArchiveCard';
import SectionHeader from '../ui/SectionHeader';

export default function ArchivePreview() {
  const projects = getProjects();
  const filters = useProjectFilters(projects);
  const key = filters.category;

  return (
    <div className="home-archive" aria-labelledby="archive-title">
      <SectionHeader id="archive-title" title="Project archive" />
      <FilterBar filters={filters} total={projects.length} idPrefix="home-archive" />

      <ul className="agrid agrid--home" key={key}>
        {filters.results.map((p, i) => (
          <ArchiveCard key={p.slug} project={p} style={{ '--i': i }} />
        ))}
      </ul>
    </div>
  );
}
