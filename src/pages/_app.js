import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/hero.css';
import '../styles/projects.css';
import '../styles/pages.css';
import '../styles/case.css';
import '../styles/about.css';
import '../styles/rally.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initGA, logPageView } from '../utils/googleAnalytics';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Analytics only on the deployed site, not while developing locally
    if (process.env.NODE_ENV !== 'production') return undefined;
    initGA();
    logPageView();
    const onRoute = () => logPageView();
    router.events.on('routeChangeComplete', onRoute);
    return () => router.events.off('routeChangeComplete', onRoute);
  }, [router.events]);

  return <Component {...pageProps} />;
}
