import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SITE_URL } from '../../content/profile.mjs';

// Old case-study URLs (/projects/…) redirect to their new /work/… pages so
// existing links and search results keep working on static hosting.
const REDIRECTS = {
  doublepoint: 'doublepoint',
  sustainablyyours: 'sustainably-yours',
  sauna: 'sauna-simulator-vr',
  bugbear: 'bugbear',
  wolt: 'wolt-grocery-pickup',
  botnia: 'botnia-vikings',
  sukeltaja: 'sukeltaja',
  reaktor: 'reaktor',
};

export default function LegacyRedirect({ to }) {
  const router = useRouter();
  const href = `/work/${to}/`;

  useEffect(() => {
    router.replace(href);
  }, [router, href]);

  return (
    <>
      <Head>
        <title>Redirecting…</title>
        <meta name="robots" content="noindex" />
        <meta httpEquiv="refresh" content={`0; url=${href}`} />
        <link rel="canonical" href={`${SITE_URL}${href}`} />
      </Head>
      <p className="wrap mono" style={{ padding: '40px 0' }}>
        This page has moved: <Link href={href}>{href}</Link>
      </p>
    </>
  );
}

export function getStaticPaths() {
  return { paths: Object.keys(REDIRECTS).map((slug) => ({ params: { slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  return { props: { to: REDIRECTS[params.slug] } };
}
