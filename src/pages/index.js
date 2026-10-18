import Layout from '../components/layout/Layout';
import Hero from '../components/hero/Hero';
import FeaturedWork from '../components/home/FeaturedWork';
import ArchivePreview from '../components/home/ArchivePreview';
import AboutPanel from '../components/home/AboutPanel';
import { getProject } from '../lib/projects';
import { PROFILE, SITE_URL } from '../content/profile.mjs';

const PERSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PROFILE.name,
  url: `${SITE_URL}/`,
  jobTitle: 'Product Manager',
  address: { '@type': 'PostalAddress', addressLocality: 'Helsinki', addressCountry: 'FI' },
  email: `mailto:${PROFILE.email}`,
  sameAs: PROFILE.social.map((s) => s.href),
};

export default function Home() {
  return (
    <Layout overlayHeader seo={{ path: '/', jsonLd: PERSON_LD }}>
      <Hero inset={getProject('doublepoint')} />
      <FeaturedWork />
      <section className="home-index wrap" aria-label="Archive and about">
        <ArchivePreview />
        <AboutPanel />
      </section>
    </Layout>
  );
}
