import { renderToString } from "react-dom/server";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { App } from "../src/App";
import { products } from "../src/catalog";
import site from "../src/data/site.json";
import company from "../src/data/company.json";
import t from "../src/locales/en.json";
import { siteSrcSet } from "../src/sitePath";
const ids = new Set(),
  slugs = new Set();
for (const p of products) {
  if (
    !p.id ||
    !p.name ||
    !/^[a-z0-9-]+$/.test(p.slug) ||
    ids.has(p.id) ||
    slugs.has(p.slug) ||
    !site.families.some((f) => f.name === p.family)
  )
    throw Error(`Invalid or duplicate product: ${p.id}`);
  ids.add(p.id);
  slugs.add(p.slug);
  await access("public" + (p.image || "/images/product-fallback.svg"));
}
if (!site.heroSlides.length)
  throw Error("Add at least one hero slide in site.json.");
for (const slide of site.heroSlides) await access("public" + slide.image);
const escape = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const template = await readFile("dist/index.html", "utf8");
const routes = [
  "/",
  "/about/",
  "/products/",
  "/contact/",
  ...products.map((p) => `/products/${p.slug}/`),
  "/404.html",
];
const origin = process.env.SITE_URL || site.canonicalOrigin;
if (origin && !/^https:\/\/[^/]+\/?$/.test(origin))
  throw Error("SITE_URL must be a valid HTTPS origin, without a path.");
for (const path of routes) {
  const product = products.find((p) => path === `/products/${p.slug}/`);
  const title = product
    ? `${product.name} | OBC`
    : path === "/"
      ? t.seo.homeTitle
      : path === "/about/"
        ? t.seo.aboutTitle
        : path === "/products/"
          ? t.seo.productsTitle
          : path === "/contact/"
            ? t.seo.contactTitle
            : "Page not found | OBC";
  const description = product
    ? `${product.name}. ${product.description || "Contact OBC for product specifications and requirements."}`.slice(
        0,
        170,
      )
    : path === "/about/"
      ? t.seo.aboutDescription
      : path === "/products/"
        ? t.seo.productsDescription
        : path === "/contact/"
          ? t.seo.contactDescription
          : t.seo.homeDescription;
  const url = origin ? new URL(path, origin).href : null;
  const structured = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || undefined,
        sku: product.partNumber || product.model || undefined,
        brand: { "@type": "Brand", name: product.brand },
        manufacturer: { "@type": "Organization", name: product.manufacturer },
      }
    : {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: company.legalName,
        telephone: company.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: company.address,
          addressLocality: "Riyadh",
          addressCountry: "SA",
        },
      };
  let head = `<meta name="description" content="${escape(description)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website">`;
  if (url)
    head += `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}">`;
  if (origin) {
    const image = new URL(product?.image || "/images/hero.webp", origin).href;
    head += `<meta property="og:image" content="${escape(image)}"><meta name="twitter:card" content="summary_large_image">`;
    if (path !== "/" && path !== "/404.html") {
      const current =
        product?.name || site.nav.find((n) => n.href === path)?.label || title;
      const crumbs = [
        { name: t.common.home, path: "/" },
        ...(product ? [{ name: t.common.products, path: "/products/" }] : []),
        { name: current, path },
      ];
      const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: new URL(c.path, origin).href,
        })),
      };
      head += `<script type="application/ld+json">${JSON.stringify(breadcrumb).replace(/</g, "\\u003c")}</script>`;
    }
  }
  if (path === "/404.html") head += '<meta name="robots" content="noindex">';
  head += `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, "\\u003c")}</script>`;
  const heroPreload =
    path === "/"
      ? `<link rel="preload" as="image" type="image/avif" imagesrcset="${escape(siteSrcSet(site.heroSlides[0].avifSrcSet))}" imagesizes="100vw" fetchpriority="high">`
      : "";
  const html = template
    .replace("</title>", () => "</title>" + heroPreload)
    .replace(
      '<script type="module"',
      '<script type="module" fetchpriority="low"',
    )
    .replace(/<title>.*?<\/title>/, () => `<title>${escape(title)}</title>`)
    .replace("</head>", () => head + "</head>")
    .replace(
      '<div id="root"></div>',
      () => `<div id="root">${renderToString(<App path={path} />)}</div>`,
    );
  const file = path === "/404.html" ? "dist/404.html" : `dist${path}index.html`;
  await mkdir(file.substring(0, file.lastIndexOf("/")), { recursive: true });
  await writeFile(file, html);
}
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${new URL("/sitemap.xml", origin).href}\n` : ""}`,
);
if (origin)
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes
      .filter((r) => r !== "/404.html")
      .map((r) => `<url><loc>${escape(new URL(r, origin).href)}</loc></url>`)
      .join("")}</urlset>`,
  );
console.log(
  `Prerendered ${routes.length} pages, including ${products.length} product details.`,
);
if (!origin)
  console.log(
    "Set SITE_URL=https://your-domain.example at build time to emit canonical URLs and sitemap.",
  );
