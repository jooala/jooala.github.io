import './App.css';
import './card.css';
import './index.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  TransitionGroup,
  CSSTransition,
} from 'react-transition-group';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url, { shallow }) => {
      // Your custom logic here for page transitions
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
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
