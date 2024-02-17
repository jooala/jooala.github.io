import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-RFYMHFQFFK');
};

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
};
