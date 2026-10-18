import Layout from '../components/layout/Layout';
import { ExternalLink } from '../components/layout/SiteFooter';
import LocalTime from '../components/ui/LocalTime';
import Arrow from '../components/ui/Arrow';
import { PROFILE } from '../content/profile.mjs';

export default function Contact() {
  return (
    <Layout
      footerCta={false}
      seo={{
        title: 'Contact',
        description: `Get in touch with ${PROFILE.name}: email, LinkedIn and GitHub.`,
        path: '/contact/',
      }}
    >
      <section className="contact wrap" aria-labelledby="contact-title">
        <p className="page-head__kicker mono">
          <span>[04] Contact</span>
          <span>Get in touch</span>
        </p>

        <div className="contact__top">
          <h1 id="contact-title" className="contact__title display ink">
            <span>Say</span>
            <span>
              hello<span className="foot__dot">.</span>
            </span>
          </h1>
          <dl className="contact__facts mono">
            <div>
              <dt>Based in</dt>
              <dd>{PROFILE.location}</dd>
            </div>
            <div>
              <dt>Local time</dt>
              <dd>
                <LocalTime />
              </dd>
            </div>
            <div>
              <dt>Now</dt>
              <dd>Wolt+ · Frontier</dd>
            </div>
            <div>
              <dt>Best via</dt>
              <dd>Email</dd>
            </div>
          </dl>
        </div>

        <div className="contact__grid">
          <div className="contact__lead">
            <p className="serif">
              The best way to reach me is email. I&rsquo;m always happy to talk about products, interfaces,
              games, or something you&rsquo;re building.
            </p>
          </div>

          <a href={`mailto:${PROFILE.email}`} className="contact__mail">
            <span className="mono">Email</span>
            <span className="contact__mail-addr">{PROFILE.email}</span>
            <span className="foot__mail-arrow" aria-hidden="true">
              <Arrow dir="up-right" size={28} strokeWidth={1.5} />
            </span>
          </a>

          <ul className="contact__links">
            {PROFILE.social.map((s, i) => (
              <li key={s.href}>
                <ExternalLink href={s.href} className="contact__link">
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="title">{s.label}</span>
                  <Arrow dir="up-right" size={16} />
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
}
