import './App.css';
import './card.css';
import './index.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  TransitionGroup,
  CSSTransition,
} from 'react-transition-group';
import { initGA, logPageView } from '../utils/googleAnalytics';
import dynamic from 'next/dynamic';

const CustomCursor = dynamic(() => import('../components/CustomCursor'), { ssr: false });


function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Disable browser scroll restoration so we control it manually
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    initGA();
    logPageView();

    const handleRouteChange = (url) => {
      logPageView();
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  return (
    <>
      <CustomCursor />
      <TransitionGroup className="transition-group" component={null}>
        <CSSTransition
          key={router.pathname}
          timeout={300}
          classNames="fade"
        >
          <Component {...pageProps} />
        </CSSTransition>
      </TransitionGroup>
    </>
  );
}

export default MyApp;
