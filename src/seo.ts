// Page metadata, structured data and URL rules shared by the SSR server,
// the static staging build and the tests.
import { products, type Product } from "./catalog";
import site from "./data/site.json";
import company from "./data/company.json";
import locations from "./data/locations.json";
import t from "./locales/en.json";

export type Family = (typeof site.families)[number];
export type Location = (typeof locations)[number];
export { locations };

export const DEFAULT_ORIGIN = "https://ososalbenaa.com";

/** URL slug rules: lowercase, "&" -> "and", other symbols -> "-", no repeats. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/°/g, " degree ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Old URLs that moved permanently (301). Keys and values are app paths. */
export const movedPaths: Record<string, string> = {
  "/products/cable-ladder-fittings-accessories/":
    "/products/cable-ladder-fittings-and-accessories/",
  "/products/hot-dip-galvanized-cable-tray-er-type/":
    "/products/hot-dip-galvanized-cable-tray-b-type/",
  "/products/cable-tray-hanger/": "/products/cable-tray-trunk-hanger/",
};

/** Products the client withdrew. These return 410 Gone. */
export const removedPaths = new Set(
  [
    "nylon-two-bolt-cable-cleat-type-ntc",
    "cable-tray-and-fittings-type-me",
    "cable-tray-fitting-bendable-splice-plate",
    "cable-tray-fitting-horizontal-fittings-connector",
    "cable-tray-fitting-bendable-horizontal-fitting-connector",
    "cable-tray-fitting-box-connector",
  ].map((s) => `/products/${s}/`),
);

export const staticRoutes = [
  "/",
  "/about/",
  "/products/",
  "/catalogue/",
  "/contact/",
];

export const productPath = (p: Product) => `/products/${p.slug}/`;
export const categoryPath = (f: Family) => `/products/${f.slug}/`;
export const locationPath = (l: Location) => `/${l.slug}/`;

/** Product ranges that have at least one product. */
export const families = site.families.filter((f) =>
  products.some((p) => p.family === f.name),
);
export const familyOf = (p: Product) =>
  families.find((f) => f.name === p.family);

export const publicRoutes = [
  ...staticRoutes,
  ...families.map(categoryPath),
  ...locations.map(locationPath),
  ...products.map(productPath),
];

export function findProduct(path: string) {
  return products.find((p) => productPath(p) === path);
}
export const findFamily = (path: string) =>
  families.find((f) => categoryPath(f) === path);
export const findLocation = (path: string) =>
  locations.find((l) => locationPath(l) === path);

/**
 * Normalise a request path: lowercase, single slashes, trailing slash,
 * no index.html, and apply permanent moves. Returns null when nothing changes.
 */
export function canonicalPathFor(rawPath: string): string | null {
  let path = rawPath;
  try {
    path = decodeURIComponent(rawPath);
  } catch {
    /* keep raw */
  }
  let next = path.toLowerCase().replace(/\/{2,}/g, "/");
  next = next.replace(/\/index\.html?$/, "/");
  if (!next.endsWith("/") && !/\.[a-z0-9]+$/.test(next)) next += "/";
  next = movedPaths[next] ?? next;
  return next === rawPath ? null : next;
}

const familyLabel = (name: string) =>
  site.families.find((f) => f.name === name)?.short ?? name;

function clip(text: string, max = 150) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\-–]$/, "") + "…";
}

/** Product titles: as descriptive as fits in 60 characters. */
export function productTitle(p: Product) {
  const range = familyOf(p)?.short ?? familyLabel(p.family);
  // A few product names are too long for a title; they carry a shorter seoName.
  const name = (p as { seoName?: string }).seoName ?? p.name;
  const options = [
    `${name} | ${range} in Riyadh, Saudi Arabia | OBC`,
    `${name} | ${range} Manufacturer in Riyadh | OBC`,
    `${name} | ${range} in Riyadh | OBC`,
    `${name} | OBC Riyadh, Saudi Arabia`,
    `${name} | OBC Riyadh`,
    `${name} | OBC`,
  ];
  return options.find((o) => o.length <= 60) ?? options[options.length - 1];
}

function productDescription(p: Product) {
  const bits = [`${p.name} by Osos Al Benaa (OBC), Riyadh.`];
  const family = familyLabel(p.family).toLowerCase();
  bits.push(
    p.material
      ? `${family[0].toUpperCase()}${family.slice(1)} product in ${p.material.toLowerCase()}.`
      : `Part of our ${family} range.`,
  );
  if (p.finishes.length) bits.push(`Finish: ${p.finishes.join(", ")}.`);
  bits.push("View specifications and enquire on WhatsApp.");
  return clip(bits.join(" "));
}

export type PageMeta = {
  status: 200 | 404 | 410;
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  indexable: boolean;
  product?: Product;
  family?: Family;
  location?: Location;
  breadcrumb?: { name: string; path: string }[];
};

export function pageMeta(path: string): PageMeta {
  const base = {
    path,
    image: "/images/hero.webp",
    imageAlt: t.seo.ogImageAlt,
    indexable: true,
  };
  const product = findProduct(path);
  if (product)
    return {
      ...base,
      status: 200,
      title: productTitle(product),
      description: productDescription(product),
      image: product.image || base.image,
      imageAlt: product.imageAlt,
      product,
      breadcrumb: [
        { name: t.common.home, path: "/" },
        { name: t.common.products, path: "/products/" },
        ...(familyOf(product)
          ? [
              {
                name: familyOf(product)!.name,
                path: categoryPath(familyOf(product)!),
              },
            ]
          : []),
        { name: product.name, path },
      ],
    };
  const family = findFamily(path);
  if (family)
    return {
      ...base,
      status: 200,
      title: family.seoTitle,
      description: family.seoDescription,
      image: family.image || base.image,
      imageAlt: family.name,
      family,
      breadcrumb: [
        { name: t.common.home, path: "/" },
        { name: t.common.products, path: "/products/" },
        { name: family.name, path },
      ],
    };
  const location = findLocation(path);
  if (location)
    return {
      ...base,
      status: 200,
      title: location.seoTitle,
      description: location.seoDescription,
      location,
      breadcrumb: [
        { name: t.common.home, path: "/" },
        { name: location.h1, path },
      ],
    };
  const page = (
    title: string,
    description: string,
    name?: string,
    extra: Partial<PageMeta> = {},
  ): PageMeta => ({
    ...base,
    status: 200,
    title,
    description,
    breadcrumb: name
      ? [
          { name: t.common.home, path: "/" },
          { name, path },
        ]
      : undefined,
    ...extra,
  });
  switch (path) {
    case "/":
      return page(t.seo.homeTitle, t.seo.homeDescription);
    case "/about/":
      return page(t.seo.aboutTitle, t.seo.aboutDescription, t.common.about, {
        image: "/images/system.webp",
      });
    case "/products/":
      return page(
        t.seo.productsTitle,
        t.seo.productsDescription,
        t.common.products,
      );
    case "/catalogue/":
      return page(
        t.seo.catalogueTitle,
        t.seo.catalogueDescription,
        t.common.catalogue,
        {
          image: "/images/catalogue-cover.webp",
          imageAlt: t.catalogue.coverAlt,
        },
      );
    case "/contact/":
      return page(
        t.seo.contactTitle,
        t.seo.contactDescription,
        t.common.contact,
      );
  }
  return {
    ...base,
    status: removedPaths.has(path) ? 410 : 404,
    title: t.seo.notFoundTitle,
    description: t.seo.notFoundDescription,
    indexable: false,
  };
}

const abs = (origin: string, path: string) => new URL(path, origin).href;

const showroom = {
  id: "#showroom",
  name: `${company.legalName} – Showroom`,
  street: company.showroomStreet,
  geo: { latitude: 24.6423374, longitude: 46.7212812 },
  map: "https://www.google.com/maps?cid=4367063330069291959",
};
const factory = {
  id: "#factory",
  name: `${company.legalName} – Factory`,
  street: company.factoryStreet,
  geo: { latitude: 24.619462, longitude: 46.8533602 },
  map: "https://www.google.com/maps?cid=7892875817503817879",
};

function localBusiness(origin: string, loc: typeof showroom) {
  return {
    "@type": "LocalBusiness",
    "@id": abs(origin, "/") + loc.id,
    name: loc.name,
    parentOrganization: { "@id": abs(origin, "/") + "#organization" },
    url: abs(origin, "/contact/"),
    image: abs(origin, "/images/logo.webp"),
    telephone: `+${company.phoneDigits}`,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.street,
      addressLocality: "Riyadh",
      addressRegion: "Riyadh Province",
      postalCode: company.postalCode,
      addressCountry: "SA",
    },
    geo: { "@type": "GeoCoordinates", ...loc.geo },
    hasMap: loc.map,
    areaServed: [
      ...locations.map((l) => ({
        "@type": "City",
        name: l.city,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: l.region,
        },
      })),
      { "@type": "Country", name: "Saudi Arabia" },
    ],
  };
}

/** JSON-LD graph for a page. Everything here mirrors visible page content. */
export function structuredData(meta: PageMeta, origin: string) {
  const url = abs(origin, meta.path);
  const orgId = abs(origin, "/") + "#organization";
  const organization = {
    "@type": "Organization",
    "@id": orgId,
    name: company.legalName,
    alternateName: [company.name, company.brand],
    url: abs(origin, "/"),
    logo: abs(origin, "/images/logo.webp"),
    email: company.email,
    telephone: `+${company.phoneDigits}`,
    foundingDate: company.established,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.showroomStreet,
      addressLocality: "Riyadh",
      addressRegion: "Riyadh Province",
      postalCode: company.postalCode,
      addressCountry: "SA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${company.phoneDigits}`,
      email: company.email,
      contactType: "sales",
      areaServed: "SA",
      availableLanguage: ["en", "ar"],
    },
  };
  const graph: Record<string, unknown>[] = [organization];
  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": url + "#webpage",
    url,
    name: meta.title,
    description: meta.description,
    inLanguage: "en",
    isPartOf: { "@id": abs(origin, "/") + "#website" },
    publisher: { "@id": orgId },
  };
  if (meta.path === "/") {
    graph.push({
      "@type": "WebSite",
      "@id": abs(origin, "/") + "#website",
      url: abs(origin, "/"),
      name: company.name,
      inLanguage: "en",
      publisher: { "@id": orgId },
    });
  }
  // The showroom and factory are on every page so search engines always see
  // the business's name, address, phone and service areas.
  graph.push(localBusiness(origin, showroom), localBusiness(origin, factory));
  if (meta.path === "/about/") webPage["@type"] = "AboutPage";
  if (meta.path === "/contact/") {
    webPage["@type"] = "ContactPage";
  }
  if (meta.path === "/products/") {
    webPage["@type"] = "CollectionPage";
    webPage.mainEntity = {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: abs(origin, productPath(p)),
        name: p.name,
      })),
    };
  }
  if (meta.family) {
    const list = products.filter((p) => p.family === meta.family!.name);
    webPage["@type"] = "CollectionPage";
    webPage.mainEntity = {
      "@type": "ItemList",
      name: meta.family.name,
      numberOfItems: list.length,
      itemListElement: list.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: abs(origin, productPath(p)),
        name: p.name,
      })),
    };
  }
  if (meta.location) {
    webPage.about = { "@id": abs(origin, "/") + showroom.id };
    webPage.spatialCoverage = {
      "@type": "City",
      name: meta.location.city,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: meta.location.region,
      },
    };
  }
  if (meta.product) {
    const p = meta.product;
    graph.push({
      "@type": "Product",
      "@id": url + "#product",
      name: p.name,
      description: p.description || meta.description,
      image: p.image ? abs(origin, p.image) : undefined,
      sku: p.partNumber || p.model || undefined,
      category: p.family,
      material: p.material || undefined,
      brand: { "@type": "Brand", name: p.brand },
      manufacturer: { "@type": "Organization", name: p.manufacturer },
      url,
    });
    webPage.mainEntity = { "@id": url + "#product" };
  }
  if (meta.breadcrumb) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": url + "#breadcrumb",
      itemListElement: meta.breadcrumb.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: abs(origin, c.path),
      })),
    });
    webPage.breadcrumb = { "@id": url + "#breadcrumb" };
  }
  graph.push(webPage);
  return { "@context": "https://schema.org", "@graph": graph };
}

const esc = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/** All <head> tags for a page, rendered on the server. */
export function headTags(
  meta: PageMeta,
  opts: { origin: string; noindex?: boolean; assetPath: (p: string) => string },
) {
  const url = abs(opts.origin, meta.path);
  const image = abs(opts.origin, meta.image);
  const robots =
    opts.noindex || !meta.indexable
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1";
  const tags = [
    `<meta name="description" content="${esc(meta.description)}">`,
    `<meta name="robots" content="${robots}">`,
  ];
  if (meta.indexable) tags.push(`<link rel="canonical" href="${esc(url)}">`);
  tags.push(
    `<meta property="og:site_name" content="${esc(company.name)}">`,
    `<meta property="og:type" content="${meta.product ? "product" : "website"}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:alt" content="${esc(meta.imageAlt)}">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<meta name="geo.region" content="SA-01">`,
    `<meta name="geo.placename" content="Riyadh">`,
  );
  const early: string[] = [];
  if (meta.path === "/")
    early.push(
      `<link rel="preload" as="image" type="image/avif" imagesrcset="${esc(
        site.heroSlides[0].avifSrcSet
          .split(",")
          .map((s) => {
            const [p, d] = s.trim().split(/\s+/);
            return `${opts.assetPath(p)} ${d}`;
          })
          .join(", "),
      )}" imagesizes="100vw" fetchpriority="high">`,
    );
  if (meta.status === 200)
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(
        structuredData(meta, opts.origin),
      ).replace(/</g, "\\u003c")}</script>`,
    );
  return { title: esc(meta.title), early: early.join(""), tags: tags.join("") };
}

export function robotsTxt(origin: string, noindex = false) {
  return noindex
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\n\nSitemap: ${abs(origin, "/sitemap.xml")}\n`;
}

export function sitemapXml(origin: string, lastmod: string) {
  const urls = publicRoutes.map((path) => {
    const meta = pageMeta(path);
    const img = meta.product?.image
      ? `<image:image><image:loc>${esc(abs(origin, meta.product.image))}</image:loc></image:image>`
      : "";
    return `<url><loc>${esc(abs(origin, path))}</loc><lastmod>${lastmod}</lastmod>${img}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.join("")}</urlset>\n`;
}
