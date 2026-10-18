import Link from 'next/link';
import ProjectVisual from './ProjectVisual';
import Arrow from '../ui/Arrow';

export default function FeaturedCard({ project, className = '', delay = 0, eager = false }) {
  return (
    <article className={`fcard ${className}`}>
      <Link href={project.href} className="fcard__link">
        <div className={`fcard__media wipe ${project.cover?.scrim === 'strong' ? 'fcard__media--strong' : ''}`} style={{ '--reveal-delay': `${delay}ms` }}>
          <ProjectVisual project={project} eager={eager} />
          <span className="fcard__scrim" aria-hidden="true" />
          <div className="fcard__over">
            <span className="fcard__no mono">{project.no}</span>
            <h3 className="fcard__title title">{project.title}</h3>
            <ul className="fcard__hl mono">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <span className="fcard__btn" aria-hidden="true">
              <Arrow size={14} />
            </span>
          </div>
        </div>
        <div className="fcard__cap">
          <p className="fcard__sub">{project.subtitle}</p>
          <p className="fcard__meta mono">
            <span>{project.role}</span>
            {project.yearLabel && <span>{project.yearLabel}</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}
