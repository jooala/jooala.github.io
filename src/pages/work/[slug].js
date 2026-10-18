import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import CaseBlocks from '../../components/case/CaseBlocks';
import ProjectNav from '../../components/case/ProjectNav';
import { Poster } from '../../components/projects/ProjectVisual';
import { ExternalLink } from '../../components/layout/SiteFooter';
import Arrow from '../../components/ui/Arrow';
import { getAllSlugs, getProject, getAdjacent, getProjects } from '../../lib/projects';
import { withImageSizes, imageSize } from '../../lib/imageSize';

function Meta({ label, value }) {
  return (
    <div>
      <dt className="mono">{label}</dt>
      <dd>{value ?? <span className="todo mono">To add</span>}</dd>
    </div>
  );
}

export default function CaseStudy({ slug, sections, heroSize }) {
  const project = getProject(slug);
  const { prev, next } = getAdjacent(slug);
  const total = getProjects().length;
  const hero = project.hero || project.cover;

  return (
    <Layout
      seo={{
        title: project.title,
        description: project.summary,
        path: project.href,
        image: hero?.src || '/og-cover.jpg',
        type: 'article',
        noIndex: project.noIndex,
      }}
    >
      <article className="case">
        <header className="case-hero wrap">
          <p className="case-hero__top mono">
            <Link href="/work/" className="case-hero__back">
              <Arrow dir="left" size={11} /> Archive
            </Link>
            <span>
              Project {project.no} / {String(total).padStart(2, '0')}
            </span>
            <span className="case-hero__cats">{project.categoryLabels.join(' / ')}</span>
          </p>

          <h1 className="case-hero__title display ink">{project.title}</h1>

          <div className="case-hero__grid">
            <p className="case-hero__summary serif">{project.summary}</p>
            <dl className="case-hero__meta">
              <Meta label="Role" value={project.role} />
              <Meta label="Year" value={project.year ?? project.status ?? null} />
              <Meta label="Context" value={project.context} />
              {project.client && <Meta label="Client" value={project.client} />}
              {project.tools?.length > 0 && <Meta label="Tools" value={project.tools.join(', ')} />}
            </dl>
          </div>

          {project.links?.length > 0 && (
            <ul className="case-hero__links">
              {project.links.map((l) => (
                <li key={l.href}>
                  <ExternalLink href={l.href} className="mono">
                    {l.label} <Arrow dir="up-right" size={11} />
                  </ExternalLink>
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="case-hero__media wrap">
          <div className="case-hero__frame wipe is-in">
            {hero ? (
              <img src={hero.src} alt={hero.alt || ''} fetchPriority="high" decoding="async" {...heroSize} />
            ) : (
              <Poster project={project} size="hero" />
            )}
          </div>
        </div>

        <CaseBlocks sections={sections} />
      </article>

      <ProjectNav prev={prev} next={next} />
    </Layout>
  );
}

export function getStaticPaths() {
  return { paths: getAllSlugs().map((slug) => ({ params: { slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  const project = getProject(params.slug);
  const hero = project.hero || project.cover;
  return {
    props: {
      slug: params.slug,
      sections: withImageSizes(project.sections),
      heroSize: (hero && imageSize(hero.src)) || {},
    },
  };
}
