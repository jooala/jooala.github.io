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
    title: document.title, // Optionally, you can include the title of the page
  });
};
