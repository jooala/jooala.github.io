import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PROFILE } from '../../content/profile.mjs';
import LocalTime from '../ui/LocalTime';
import Arrow from '../ui/Arrow';

export const NAV = [
  { href: '/#work', label: 'Work', match: (p) => p === '/' },
  { href: '/work/', label: 'Archive', match: (p) => p.startsWith('/work') },
  { href: '/about/', label: 'About', match: (p) => p.startsWith('/about') },
  { href: '/contact/', label: 'Contact', match: (p) => p.startsWith('/contact') },
];

export default function SiteHeader({ overlay = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close the mobile menu on navigation
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  // Lock scroll, close on Escape, keep focus inside the open menu
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = menuRef.current?.querySelector('a, button');
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === 'Tab' && menuRef.current) {
        const items = [...menuRef.current.querySelectorAll('a, button')];
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const path = router.asPath.split(/[?#]/)[0];

  return (
    <header className={`mast ${overlay ? 'mast--overlay' : ''}`}>
      <div className="mast__inner wrap">
        <Link href="/" className="mast__brand" aria-label={`${PROFILE.name}, home`}>
          <span>{PROFILE.firstName}</span>
          <span>{PROFILE.lastName}</span>
        </Link>

        <p className="mast__desc mono">
          {PROFILE.disciplines.join(' · ')}
          <br />
          Helsinki, FI
        </p>

        <nav className="mast__nav" aria-label="Primary">
          <ul>
            {NAV.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="mast__link mono"
                  aria-current={item.match(path) && item.label !== 'Work' ? 'page' : undefined}
                >
                  <span className="mast__idx">0{i + 1}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mast__meta mono">
          <LocalTime />
          <span className="mast__dot" aria-hidden="true" />
        </div>

        <button
          ref={buttonRef}
          type="button"
          className="mast__menu-btn mono"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
          <span className={`mast__burger ${open ? 'is-open' : ''}`} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>

      <div
        id="site-menu"
        ref={menuRef}
        className={`menu ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
      >
        <nav aria-label="Mobile">
          <ol className="menu__list">
            <li>
              <Link href="/" className="menu__link">
                <span className="mono">00</span>Home
              </Link>
            </li>
            {NAV.map((item, i) => (
              <li key={item.href}>
                <Link href={item.href} className="menu__link" onClick={() => setOpen(false)}>
                  <span className="mono">0{i + 1}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="menu__foot mono">
          <a href={`mailto:${PROFILE.email}`}>
            {PROFILE.email} <Arrow dir="up-right" size={12} />
          </a>
          <span>{PROFILE.location} · <LocalTime /></span>
        </div>
      </div>
    </header>
  );
}
