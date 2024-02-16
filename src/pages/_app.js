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

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    initGA();
    logPageView();

    const handleRouteChange = (url) => {
      logPageView();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  return (
    <TransitionGroup className="transition-group" component={null}>
      <CSSTransition
        key={router.pathname}
        timeout={300}
        classNames="fade"
      >
        <Component {...pageProps} />
      </CSSTransition>
    </TransitionGroup>
  );
}

export default MyApp;
