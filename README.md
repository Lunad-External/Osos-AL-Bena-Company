# Osos Al Benaa — static React website

React 19, TypeScript, Vite and Tailwind CSS. The production build renders real HTML for Home, About, Products, Contact, all 41 product details and a 404 page. React hydrates existing HTML for search, filters, the mobile menu and the WhatsApp enquiry form. No application server or CMS is needed.

## Run locally

Requires Node.js 22.12+ (Node 24 was used here) and npm.

```sh
npm ci
npm run dev
```

## Build and deploy

```sh
npm run build
npm run preview
```

Deploy the **contents of `dist/`** to your static web server. Every route has its own `index.html`; do not use an SPA catch-all that serves the Home HTML for every URL. Configure the host to serve `404.html` for missing routes. The site assumes deployment at the domain root.

GitHub Pages deployment is configured in `.github/workflows/deploy-pages.yml`. It publishes the `main` branch to the project site at `https://lunad-external.github.io/Osos-AL-Bena-Company/`. In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**.

The default canonical domain is `https://www.ososalbenaa.com`, taken from the supplied brochure. Confirm this is the intended production domain. To override it at build time:

```sh
SITE_URL=https://your-company-domain.com npm run build
```

This emits canonical URLs, Open Graph URLs and `sitemap.xml`. Without `SITE_URL`, the build uses `canonicalOrigin` from `site.json`. If that JSON field is null, domain-dependent metadata and sitemap are omitted. `robots.txt` is always emitted. Set the same domain in `src/data/site.json` as `canonicalOrigin` if you prefer JSON configuration. Every page has its own title and description; product structured data contains no fabricated price, ratings or stock information.

You can inspect all generated HTML without running JavaScript. A plain static server is sufficient:

```sh
python3 -m http.server 4173 --directory dist
```

## Edit content without editing components

| File | Owns |
| --- | --- |
| `src/data/products.json` | All 41 products, stable IDs/slugs, manufacturer/origin, descriptions, specifications, facet values, image paths and source-row provenance |
| `src/data/company.json` | Company introduction, capabilities, address, phone, WhatsApp destination and verification status |
| `src/data/site.json` | Navigation, product families, featured product IDs, hero image slides, locale metadata, canonical domain and copyright year |
| `src/locales/en.json` | English UI labels, page copy, image descriptions, validation messages, WhatsApp message templates and SEO text |
| `public/images/provenance.json` | Source and generation provenance for images |

After changing JSON, rebuild and redeploy `dist/`. A static deployment does not update itself when repository JSON changes.

Product IDs and slugs must be unique. Preserve slugs after publication, or add permanent redirects on your host. Source metadata records the original workbook; source values are historical evidence, not the field to edit for displayed content. Do not fill missing specifications by guessing. If a spec is absent, omit it. An unknown/null image uses the local fallback; a broken image also switches to the fallback after hydration. Use a root-relative local path for a new image and a meaningful `imageAlt`.

The BTS cleat is kept as **BTS (India), India**. The rest of the workbook names OBC. This distinction must survive content updates.

## WhatsApp enquiries

All WhatsApp links use the brochure number, `+966 56 370 2823`, from `company.json`. Its registration as a WhatsApp destination has **not** been independently verified. Confirm it with the company before production. Changing `phoneDigits` changes both WhatsApp and call links.

The contact form validates required fields and opens a URL-encoded draft in WhatsApp. The visitor must press Send in WhatsApp. This website cannot confirm message delivery and does not save personal information. There is no email submission backend, booking engine, cart or payment flow. No real enquiry messages were sent during testing.

## Localization and future CMS

English is the only shipped language. UI copy is separated from components, and product/company data is separated from rendering. Future localization should introduce translated JSON, locale selection at build time, localized routes, `lang`/`dir`, hreflang and RTL review. Do not show a language switcher until another language exists. Stable JSON IDs can map to CMS records; replace the build-time data source rather than rewrite page layouts. There is no unused CMS integration in this implementation.

## Tests

```sh
npm test
npm run build
npm run test:e2e
```

The browser suite uses Chromium. This cloud environment has `/usr/bin/chromium`; on another machine install Playwright Chromium with `npx playwright install chromium`, or set `CHROMIUM_PATH` to an installed executable. The config automatically uses the bundled browser if the cloud path is absent.

Unit tests cover source-row retention, search, combined facets, URL state and WhatsApp encoding. Browser tests cover catalog interactions, every detail URL, content without JavaScript, mobile navigation/filter focus, image fallback, form handoff, responsive overflow and automated WCAG checks. Automated accessibility checks are useful evidence, not a certification of compliance.

## Assets and design

`design.md` records the design decisions. Brand/logo and matched product illustrations come from the supplied brochure. The two hero images are AI-generated and visibly described as illustrative; they do not depict a verified OBC facility. Some products intentionally use the neutral fallback rather than an incorrect product photo. The full brochure is not published because it contains administrative and approval documents. Self-hosted Barlow fonts retain their upstream OFL licenses; Lucide icons use ISC licensing.

The user authorized proceeding with the brand-derived design despite blocked live reference research. No claim is made that Pinterest, Dribbble, Behance, Awwwards or Google references were reviewed. Vercel React Best Practices, Impeccable and Ponytail instructions were read from the user-provided public repositories and used for this work; no telemetry hooks were installed.

See the Git history for source publication. Production deployment and domain ownership have not been verified.

## Selected UI: Option B with an overlay hero

The user selected the red-led reference with a full-width hero instead of the reference's split layout. A lightly blurred background image (1.5px) sits under a solid dark readability overlay; white headings/body and a red primary CTA/white secondary CTA are rendered over it. Responsive AVIF sources have WebP fallback. Only the first scene loads initially; later scenes load on selection while the first scene remains underneath during decoding. Previous/next buttons change the image manually and announce its index; there is no autoplay or carousel dependency. The first image and all hero content exist in prerendered HTML and remain visible without JavaScript.

Edit `heroSlides` in `src/data/site.json` to change the image list and responsive source sets. Keep at least one slide and retain an honest illustrative caption in `src/locales/en.json`. Generated-image source/prompt provenance remains in `public/images/provenance.json`.

Separate white section panels sit on a soft-gray canvas. Blue headings come from the logo; red denotes primary actions and links; green is reserved for WhatsApp. Product cards have subtle downward shadows and 8px corners; major panels have 12px corners (10px on mobile). No gradients are used.
