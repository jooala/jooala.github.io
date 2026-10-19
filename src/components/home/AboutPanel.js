import Link from 'next/link';
import { PROFILE } from '../../content/profile.mjs';
import SectionHeader from '../ui/SectionHeader';
import Arrow from '../ui/Arrow';
import PortraitSlot from '../ui/PortraitSlot';

export default function AboutPanel() {
  return (
    <aside className="home-about" aria-labelledby="about-title">
      <SectionHeader id="about-title" title="About" />

      <div className="home-about__visual">
        <span className="home-about__blue" aria-hidden="true" />
        <PortraitSlot className="home-about__photo" />
        <p className="home-about__note mono" aria-hidden="true">
          Products
          <br />
          UX design
          <br />
          Games
          <br />& whatever&rsquo;s next
        </p>
      </div>

      <h3 className="home-about__name">{PROFILE.name}</h3>
      <div className="home-about__bio">
        {PROFILE.shortBio.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <Link href="/about/" className="pill-link">
        <span className="pill-link__dot" aria-hidden="true">
          <Arrow size={13} />
        </span>
        <span className="mono">More about me</span>
      </Link>

      <dl className="home-about__facts mono">
        <div>
          <dt>Based in</dt>
          <dd>{PROFILE.location}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>
            <a href={`mailto:${PROFILE.email}`}>Send an email</a>
          </dd>
        </div>
      </dl>
    </aside>
  );
}
