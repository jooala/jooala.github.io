import Link from 'next/link';
import Layout from '../components/layout/Layout';
import Arrow from '../components/ui/Arrow';

export default function NotFound() {
  return (
    <Layout seo={{ title: 'Page not found', path: '/404/', noIndex: true }}>
      <section className="notfound wrap">
        <p className="page-head__kicker mono">
          <span>Error</span>
          <span>Index —</span>
        </p>
        <h1 className="notfound__title display ink">404</h1>
        <p className="notfound__text serif">This page doesn&rsquo;t exist, or it moved when the portfolio was rebuilt.</p>
        <div className="notfound__links">
          <Link href="/" className="pill-link">
            <span className="pill-link__dot" aria-hidden="true">
              <Arrow size={13} />
            </span>
            <span className="mono">Home</span>
          </Link>
          <Link href="/work/" className="pill-link">
            <span className="pill-link__dot" aria-hidden="true">
              <Arrow size={13} />
            </span>
            <span className="mono">Project archive</span>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
