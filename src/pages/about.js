import Link from 'next/link';
import Layout from '../components/layout/Layout';
import PortraitSlot from '../components/ui/PortraitSlot';
import SectionHeader from '../components/ui/SectionHeader';
import { ArchiveCard } from '../components/projects/ArchiveCard';
import Arrow from '../components/ui/Arrow';
import useReveal from '../components/ui/useReveal';
import { PROFILE } from '../content/profile.mjs';
import { getFeatured } from '../lib/projects';

// TO ADD markers only while drafting (dev server)
const SHOW_TODO = process.env.NODE_ENV !== 'production';

function IndexTable({ rows }) {
  return (
    <ol className="itable">
      {rows.map((row, i) => {
        const inner = (
          <>
            <span className="itable__n mono">{String(i + 1).padStart(2, '0')}</span>
            <span className="itable__org title">{row.org}</span>
            <span className="itable__role">{row.role ?? (SHOW_TODO && <span className="todo mono">Role to add</span>)}</span>
            <span className="itable__period mono">{row.period ?? (SHOW_TODO && <span className="todo">Year to add</span>)}</span>
            <span className="itable__go" aria-hidden="true">{row.href && <Arrow size={13} />}</span>
          </>
        );
        return (
          <li key={`${row.org}-${i}`}>
            {row.href ? (
              <Link href={row.href} className="itable__row itable__row--link">
                {inner}
              </Link>
            ) : (
              <div className="itable__row">{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function About() {
  const { about } = PROFILE;
  const ref = useReveal({ threshold: 0.02 });

  return (
    <Layout
      seo={{
        title: 'About',
        description: `${PROFILE.name}: product manager in Helsinki combining design, technology and curiosity. Product Lead for Wolt+.`,
        path: '/about/',
      }}
    >
      <div ref={ref}>
        <header className="about-hero wrap">
          <p className="page-head__kicker mono">
            <span>[03] About</span>
            <span>{PROFILE.location}</span>
          </p>
          <div className="about-hero__grid">
            <div className="about-hero__text">
              <h1 className="about-hero__title display ink">About</h1>
              <p className="about-hero__headline title">{about.headline}</p>
            </div>
            <div className="about-hero__visual">
              <span className="about-hero__blue" aria-hidden="true" />
              <span className="about-hero__concrete" aria-hidden="true" />
              <PortraitSlot className="about-hero__photo" />
            </div>
          </div>
        </header>

        <section className="about-sec wrap reveal" aria-labelledby="now-title">
          <SectionHeader id="now-title" title="Now" />
          <div className="about-now">
            {about.now.map((item) => (
              <Link key={item.title} href={item.href} className="about-now__card">
                <span className="about-now__title display">{item.title}</span>
                <span className="about-now__text">{item.text}</span>
                <span className="about-now__go" aria-hidden="true">
                  <Arrow size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="about-sec wrap reveal" aria-labelledby="bg-title">
          <SectionHeader id="bg-title" title="Background" />
          <div className="about-bg">
            {about.body.map((p, i) => (
              <p key={p} className={i === 0 ? 'serif about-bg__lead' : 'about-bg__p'}>
                {p}
              </p>
            ))}
          </div>
        </section>

        <section className="about-sec wrap reveal" aria-labelledby="skills-title">
          <SectionHeader id="skills-title" title="Expertise" />
          <div className="about-skills">
            {about.expertise.map((g) => (
              <div key={g.area}>
                <h3 className="mono">{g.area}</h3>
                <ul>
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="about-sec wrap reveal" aria-labelledby="exp-title">
          <SectionHeader id="exp-title" title="Experience" />
          <IndexTable rows={about.experience} />
        </section>

        <section className="about-sec wrap reveal" aria-labelledby="edu-title">
          <SectionHeader id="edu-title" title="Education" />
          <IndexTable rows={about.education} />
        </section>

        <section className="about-sec wrap reveal" aria-labelledby="sel-title">
          <SectionHeader id="sel-title" title="Selected work" link={{ href: '/work/', label: 'Full archive' }} />
          <ul className="agrid">
            {getFeatured()
              .slice(0, 3)
              .map((p) => (
                <ArchiveCard key={p.slug} project={p} />
              ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
}
