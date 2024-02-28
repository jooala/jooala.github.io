import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-RFYMHFQFFK');
};

export const logPageView = () => {
  const pagePath =
    window.location.pathname +
    window.location.search +
    window.location.hash;
  ReactGA.send({
    hitType: 'pageview',
    page: pagePath,
    title: document.title,
  });
};

export const trackPageTime = () => {
  const startTime = Date.now();

  return () => {
    const endTime = Date.now();
    const timeSpent = (endTime - startTime) / 1000;

    ReactGA.event({
      category: 'Engagement',
      action: 'Time Spent on Page',
      label: window.location.pathname,
      value: Math.round(timeSpent),
      nonInteraction: true,
    });
  };
};
