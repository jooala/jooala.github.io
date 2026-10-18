import Link from 'next/link';
import ProjectVisual from './ProjectVisual';
import Arrow from '../ui/Arrow';

export function ArchiveCard({ project, style, showFlag = false }) {
  return (
    <li className="acard" style={style}>
      <Link href={project.href} className="acard__link">
        <div className="acard__media">
          <ProjectVisual project={project} variant="thumb" />
          {showFlag && project.featured && <span className="acard__flag mono">Featured</span>}
        </div>
        <div className="acard__row">
          <h3 className="acard__title title">{project.title}</h3>
          <span className="acard__no mono">{project.no}</span>
        </div>
        <p className="acard__meta mono">
          <span className="acard__cats">{project.categoryLabels.join('  ')}</span>
          <span className="acard__year">
            {project.yearLabel}
            <Arrow size={11} className="acard__arrow" />
          </span>
        </p>
      </Link>
    </li>
  );
}

// Compact horizontal index row, used by the archive's "Index" view.
export function ArchiveRow({ project, style }) {
  return (
    <li className="arow" style={style}>
      <Link href={project.href} className="arow__link">
        <span className="arow__no mono">{project.no}</span>
        <span className="arow__thumb" aria-hidden="true">
          <ProjectVisual project={project} variant="thumb" />
        </span>
        <span className="arow__title title">{project.title}</span>
        <span className="arow__role">{project.role}</span>
        <span className="arow__cats mono">{project.categoryLabels.join(' / ')}</span>
        <span className="arow__year mono">{project.yearLabel ?? '—'}</span>
        <span className="arow__arrow" aria-hidden="true">
          <Arrow size={14} />
        </span>
      </Link>
    </li>
  );
}
