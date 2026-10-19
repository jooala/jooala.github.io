import Head from 'next/head';
import { PROFILE, SITE_URL } from '../../content/profile.mjs';

const DEFAULT_DESCRIPTION =
  'Joonas Alanenpää is a product manager in Helsinki who combines design, technology and curiosity to build products, user experiences and games. Product Lead for Wolt+.';

// `path` is the site-relative URL with a trailing slash, e.g. "/work/frontier/".
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = '/og-cover.jpg',
  type = 'website',
  noIndex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${PROFILE.name}` : `${PROFILE.name}: Products, UX Design & Games`;
  const url = `${SITE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={PROFILE.name} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
