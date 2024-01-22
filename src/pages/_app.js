import './App.css';
import './card.css';
import './index.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  TransitionGroup,
  CSSTransition,
} from 'react-transition-group';
import ReactGA from 'react-ga';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Initialize ReactGA
    ReactGA.initialize('G-RFYMHFQFFK');

    // Track initial pageview
    ReactGA.pageview(
      window.location.pathname + window.location.search
    );

    // Track pageview on route change
    const handleRouteChange = (url) => {
      ReactGA.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Remove event listener when component unmounts
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
