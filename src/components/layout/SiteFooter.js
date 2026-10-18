import Link from 'next/link';
import { PROFILE } from '../../content/profile.mjs';
import { NAV } from './SiteHeader';
import Arrow from '../ui/Arrow';
import LocalTime from '../ui/LocalTime';
import useReveal from '../ui/useReveal';

export function ExternalLink({ href, children, className = '' }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

// `cta`: render the large "Let's make something" contact composition.
export default function SiteFooter({ cta = true }) {
  const ref = useReveal();
  const year = new Date().getFullYear();

  return (
    <footer className="foot" id="contact" ref={ref}>
      {cta && (
        <div className="foot__cta wrap">
          <div className="foot__cta-head">
            <p className="sh__title">
              <span className="sh__square" aria-hidden="true" />
              Contact
            </p>
            <p className="mono foot__avail">
              Products · Design · Games: say hello
            </p>
          </div>

          <h2 className="foot__headline display ink reveal">
            <span>Let&rsquo;s make</span>
            <span>
              something<span className="foot__dot">.</span>
            </span>
          </h2>

          <div className="foot__grid">
            <a href={`mailto:${PROFILE.email}`} className="foot__mail reveal" style={{ '--reveal-delay': '120ms' }}>
              <span className="mono">Email</span>
              <span className="foot__mail-addr">{PROFILE.email}</span>
              <span className="foot__mail-arrow" aria-hidden="true">
                <Arrow dir="up-right" size={28} strokeWidth={1.5} />
              </span>
            </a>
            <ul className="foot__social reveal" style={{ '--reveal-delay': '200ms' }}>
              {PROFILE.social.map((s) => (
                <li key={s.href}>
                  <ExternalLink href={s.href} className="foot__social-link">
                    <span>{s.label}</span>
                    <Arrow dir="up-right" size={14} />
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="foot__bar">
        <div className="wrap foot__bar-inner mono">
          <span className="foot__name">{PROFILE.name}</span>
          <nav aria-label="Footer">
            <ul className="foot__nav">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <span>
            {PROFILE.location} · <LocalTime />
          </span>
          <span>© {year}</span>
        </div>
      </div>
    </footer>
  );
}
