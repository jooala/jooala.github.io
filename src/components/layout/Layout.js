import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Seo from './Seo';

// Page shell: SEO tags, masthead, <main>, footer.
export default function Layout({ seo, overlayHeader = false, footerCta = true, children }) {
  return (
    <>
      <Seo {...seo} />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader overlay={overlayHeader} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter cta={footerCta} />
    </>
  );
}
