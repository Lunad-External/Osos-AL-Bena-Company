# Osos Al Benaa — server-side rendered React website

React 19, TypeScript, Vite and Tailwind CSS, served by a small Node.js (Express) server that renders every page on each request (genuine SSR). The HTML response already contains the page content, title, meta description, canonical URL, Open Graph tags and JSON-LD structured data. React then hydrates the page for search, filters, the mobile menu and the WhatsApp enquiry form.

## Run locally

Requires Node.js 20+ (22 recommended) and npm.

```sh
npm ci
npm run dev          # Vite dev server (client only, for design work)
npm run build        # client bundle -> dist/, server renderer -> dist-server/
npm run preview      # SSR server on http://localhost:3000
```

## Live site: GoDaddy cPanel (static build)

https://ososalbenaa.com runs on the client's GoDaddy **Web Hosting Deluxe (cPanel)** plan. That plan has no Node.js runtime, so production uses a static build: every page is pre-rendered to full HTML by the same renderer as the SSR server, and `.htaccess` reproduces the server's behaviour (www/HTTP → `https://ososalbenaa.com`, lowercase + trailing-slash 301s, renamed products 301, withdrawn products 410, custom 404, caching, gzip and security headers incl. HSTS).

To publish an update:

```sh
npm ci && npm run build && npm run build:static
```

1. In cPanel → File Manager → `public_html`, upload `obc-website-static.zip` (or the contents of `dist-static/`, including the hidden `.htaccess`).
2. Extract it over the existing files (overwrite), then delete the zip.
3. Check https://ososalbenaa.com, `/robots.txt` and `/sitemap.xml`.

If the catalogue PDF hasn't changed, you can leave it out of the zip to keep the upload small. GoDaddy's placeholder files were moved to `~/godaddy-placeholder-backup`.

## Production on a Node.js host (SSR)

```sh
npm ci && npm run build
NODE_ENV=production PORT=3000 SITE_URL=https://ososalbenaa.com npm start
```

For GoDaddy's Node.js Hosting (Upload ZIP), `npm run package:godaddy` writes `deploy/obc-website-godaddy.zip` with the prebuilt site and a runtime-only `package.json`.

Or with Docker: `docker build -t obc-website . && docker run -p 3000:3000 obc-website`.

Run it behind HTTPS (a load balancer, Nginx or the host's TLS). The server:

- renders every page per request and returns real status codes (200, 301, 404, 410);
- redirects `www.ososalbenaa.com`, and plain HTTP on `ososalbenaa.com` (detected from `X-Forwarded-Proto`), to `https://ososalbenaa.com` in one 301 hop; other hosts (e.g. a host's preview URL) are served as-is; set `ENFORCE_CANONICAL_ORIGIN=false` to turn this off;
- lowercases URLs and adds the trailing slash, and 301-redirects renamed product URLs (see `movedPaths` in `src/seo.ts`); withdrawn products return 410;
- serves `/robots.txt` and `/sitemap.xml` (with product images) generated from the product data;
- compresses responses, caches hashed assets for a year, and sends security headers (HSTS on HTTPS requests to the preferred origin).

Environment variables: `PORT`, `SITE_URL` (preferred origin, default `https://ososalbenaa.com`), `NODE_ENV=production`, `NOINDEX=true` for a staging deployment, `SITEMAP_LASTMOD` (YYYY-MM-DD).

All SEO rules live in `src/seo.ts`: page titles and descriptions, URL slug rules, redirects, structured data, robots.txt and the sitemap.

## Staging preview (GitHub Pages)

`.github/workflows/deploy-pages.yml` publishes a **noindex** static preview of `main` to `https://lunad-external.github.io/Osos-AL-Bena-Company/` using `npm run build:pages`. It is for review only and is hidden from search engines; production uses the cPanel static build or the SSR server above.

## Edit content without editing components

| File | Owns |
| --- | --- |
| `src/data/products.json` | All 77 products, stable IDs/slugs, manufacturer/origin, descriptions, specifications, facet values, image paths and source-row provenance |
| `src/data/company.json` | Company introduction, capabilities, address, phone, WhatsApp destination and verification status |
| `src/data/site.json` | Navigation, product families, featured product IDs, hero image slides, locale metadata, canonical domain and copyright year |
| `src/locales/en.json` | English UI labels, page copy, image descriptions, validation messages, WhatsApp message templates and SEO text |
| `public/images/provenance.json` | Source and generation provenance for images |

After changing JSON, run `npm run build` and restart the server.

Product IDs and slugs must be unique. Preserve slugs after publication; if one must change, add the old path to `movedPaths` in `src/seo.ts` (301 redirect). Source metadata records the original workbook; source values are historical evidence, not the field to edit for displayed content. Do not fill missing specifications by guessing. If a spec is absent, omit it. An unknown/null image uses the local fallback; a broken image also switches to the fallback after hydration. Use a root-relative local path for a new image and a meaningful `imageAlt`.

## WhatsApp enquiries

All WhatsApp links use the brochure number, `+966 56 370 2823`, from `company.json`. Its registration as a WhatsApp destination has **not** been independently verified. Confirm it with the company before production. Changing `phoneDigits` changes both WhatsApp and call links.

The contact form validates required fields and opens a URL-encoded draft in WhatsApp. The visitor must press Send in WhatsApp. This website cannot confirm message delivery and does not save personal information. There is no email submission backend, booking engine, cart or payment flow. No real enquiry messages were sent during testing.

## Localization and future CMS

English is the only shipped language. UI copy is separated from components, and product/company data is separated from rendering. Future localization should introduce professionally translated JSON, `/ar/` routes rendered by the same server, `lang`/`dir`, hreflang and RTL review. Do not show a language switcher until another language exists. Stable JSON IDs can map to CMS records; replace the build-time data source rather than rewrite page layouts. There is no unused CMS integration in this implementation.

## Tests

```sh
npm test
npm run build
npm run test:e2e
```

The browser suite starts the SSR server (`node server.mjs`) and uses Chromium. This cloud environment has `/usr/bin/chromium`; on another machine install Playwright Chromium with `npx playwright install chromium`, or set `CHROMIUM_PATH` to an installed executable. The config automatically uses the bundled browser if the cloud path is absent.

Unit tests cover URL slug rules, redirects, unique metadata, structured data, the sitemap, search, combined facets, URL state and WhatsApp encoding. Browser tests cover catalog interactions, every detail URL, content without JavaScript, mobile navigation/filter focus, image fallback, form handoff, responsive overflow and automated WCAG checks. Automated accessibility checks are useful evidence, not a certification of compliance.

## Assets and design

`design.md` records the design decisions. Brand/logo and matched product illustrations come from the supplied brochure. The two hero images are AI-generated and visibly described as illustrative; they do not depict a verified OBC facility. Some products intentionally use the neutral fallback rather than an incorrect product photo. The full brochure is not published because it contains administrative and approval documents. Self-hosted Barlow fonts retain their upstream OFL licenses; Lucide icons use ISC licensing.

The user authorized proceeding with the brand-derived design despite blocked live reference research. No claim is made that Pinterest, Dribbble, Behance, Awwwards or Google references were reviewed. Vercel React Best Practices, Impeccable and Ponytail instructions were read from the user-provided public repositories and used for this work; no telemetry hooks were installed.

See the Git history for source publication. Production deployment and domain ownership have not been verified.

## Selected UI: Option B with an overlay hero

The user selected the red-led reference with a full-width hero instead of the reference's split layout. A lightly blurred background image (1.5px) sits under a solid dark readability overlay; white headings/body and a red primary CTA/white secondary CTA are rendered over it. Responsive AVIF sources have WebP fallback. Only the first scene loads initially; later scenes load on selection while the first scene remains underneath during decoding. Previous/next buttons change the image manually and announce its index; there is no autoplay or carousel dependency. The first image and all hero content exist in prerendered HTML and remain visible without JavaScript.

Edit `heroSlides` in `src/data/site.json` to change the image list and responsive source sets. Keep at least one slide and retain an honest illustrative caption in `src/locales/en.json`. Generated-image source/prompt provenance remains in `public/images/provenance.json`.

Separate white section panels sit on a soft-gray canvas. Blue headings come from the logo; red denotes primary actions and links; green is reserved for WhatsApp. Product cards have subtle downward shadows and 8px corners; major panels have 12px corners (10px on mobile). No gradients are used.
