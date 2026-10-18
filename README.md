# jooala.github.io

Portfolio of Joonas Alanenpää: products, interfaces and games.
Next.js (Pages Router), statically exported to GitHub Pages.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # sitemap + static export to /out
npm run cover -- <image> <slug>   # optimized project cover images
```

- **Editing content, adding projects, deploying:** see [CONTENT.md](CONTENT.md)
- **Project data:** `src/content/projects.mjs`
- **Personal info:** `src/content/profile.mjs`

## Structure

```
src/
  content/       projects.mjs, profile.mjs (all editable content)
  lib/           project helpers (filter/sort/adjacent), build-time image sizes
  components/
    layout/      Layout, SiteHeader (masthead + mobile menu), SiteFooter, Seo
    hero/        Hero, MonolithScene (R3F), sceneAssets (procedural textures + car)
    home/        FeaturedWork, ArchivePreview, AboutPanel
    projects/    FeaturedCard, ArchiveCard/Row, ProjectVisual (+ poster), FilterBar, useProjectFilters
    case/        CaseBlocks (section renderer), VideoEmbed, ProjectNav
    ui/          Arrow, SectionHeader, RichText, LocalTime, PortraitSlot, useReveal
  pages/         /, /work, /work/[slug], /about, /contact, /404, /projects/[slug] (legacy redirects)
  styles/        tokens, base, layout, hero, projects, pages, case, about
scripts/         build-sitemap.mjs, make-cover.mjs
public/
  images/covers/ optimized project covers
  images/hero/   pre-rendered 3D hero frame
  textures/      paper grain + ink texture
```
