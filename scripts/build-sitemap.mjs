// Generates public/sitemap.xml from the content files. Runs before every
// `npm run build`; run on its own with `npm run sitemap`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECTS } from '../src/content/projects.mjs';
import { SITE_URL } from '../src/content/profile.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const today = new Date().toISOString().slice(0, 10);

const pages = [
  { loc: '/', priority: '1.0' },
  { loc: '/work/', priority: '0.9' },
  { loc: '/about/', priority: '0.8' },
  { loc: '/contact/', priority: '0.6' },
  ...PROJECTS.filter((p) => p.listed !== false && !p.noIndex).map((p) => ({
    loc: `/work/${p.slug}/`,
    priority: p.featured ? '0.8' : '0.6',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml);
console.log(`sitemap.xml: ${pages.length} URLs`);
