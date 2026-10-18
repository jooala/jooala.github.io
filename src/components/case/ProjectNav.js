import Link from 'next/link';
import ProjectVisual from '../projects/ProjectVisual';
import Arrow from '../ui/Arrow';

export default function ProjectNav({ prev, next }) {
  return (
    <nav className="pnav wrap" aria-label="More projects">
      {prev && (
        <Link href={prev.href} className="pnav__item pnav__item--prev">
          <span className="pnav__thumb" aria-hidden="true">
            <ProjectVisual project={prev} variant="thumb" />
          </span>
          <span className="pnav__text">
            <span className="mono">
              <Arrow dir="left" size={11} /> Previous · {prev.no}
            </span>
            <span className="pnav__title display">{prev.title}</span>
          </span>
        </Link>
      )}
      <Link href="/work/" className="pnav__all mono">
        <span className="pnav__grid" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        All projects
      </Link>
      {next && (
        <Link href={next.href} className="pnav__item pnav__item--next">
          <span className="pnav__text">
            <span className="mono">
              Next · {next.no} <Arrow size={11} />
            </span>
            <span className="pnav__title display">{next.title}</span>
          </span>
          <span className="pnav__thumb" aria-hidden="true">
            <ProjectVisual project={next} variant="thumb" />
          </span>
        </Link>
      )}
    </nav>
  );
}
