import Layout from '../components/layout/Layout';
import { ExternalLink } from '../components/layout/SiteFooter';
import Arrow from '../components/ui/Arrow';
import { PROFILE } from '../content/profile.mjs';

export default function Contact() {
  return (
    <Layout
      footerCta={false}
      seo={{
        title: 'Contact',
        description: `Get in touch with ${PROFILE.name}: email or LinkedIn.`,
        path: '/contact/',
      }}
    >
      <section className="contact wrap" aria-labelledby="contact-title">
        <p className="page-head__kicker mono">
          <span>[04] Contact</span>
          <span>Get in touch</span>
        </p>

        <h1 id="contact-title" className="contact__title display ink">
          <span>Say</span>
          <span>
            hello<span className="foot__dot">.</span>
          </span>
        </h1>

        {/* Email first: it's the main way to reach me */}
        <a href={`mailto:${PROFILE.email}`} className="contact__mail">
          <span className="mono">Email</span>
          <span className="contact__mail-addr">{PROFILE.email}</span>
          <span className="foot__mail-arrow" aria-hidden="true">
            <Arrow dir="up-right" size={28} strokeWidth={1.5} />
          </span>
        </a>

        <div className="contact__row">
          <p className="contact__lead serif">
            The best way to reach me is email. I&rsquo;m always happy to talk about products, UX design, games, or
            something you&rsquo;re building.
          </p>
          <dl className="contact__facts">
            {PROFILE.social.map((s) => (
              <div key={s.href}>
                <dt className="mono">{s.label}</dt>
                <dd>
                  <ExternalLink href={s.href} className="contact__link">
                    Profile
                    <Arrow dir="up-right" size={14} />
                  </ExternalLink>
                </dd>
              </div>
            ))}
            <div>
              <dt className="mono">Based in</dt>
              <dd>{PROFILE.location}</dd>
            </div>
          </dl>
        </div>
      </section>
    </Layout>
  );
}
