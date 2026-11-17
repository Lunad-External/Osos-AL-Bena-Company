// STAGING ONLY: writes a static, noindex preview for GitHub Pages using the
// same server renderer. Production uses `npm start` (server.mjs) for SSR.
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { products } from "../src/catalog";
import site from "../src/data/site.json";
import {
  render,
  publicRoutes,
  robotsTxt,
  DEFAULT_ORIGIN,
} from "../src/entry-server";

const ids = new Set(),
  slugs = new Set();
for (const p of products) {
  if (
    !p.id ||
    !p.name ||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug) ||
    ids.has(p.id) ||
    slugs.has(p.slug) ||
    !site.families.some((f) => f.name === p.family)
  )
    throw Error(`Invalid or duplicate product: ${p.id}`);
  ids.add(p.id);
  slugs.add(p.slug);
  await access("public" + (p.image || "/images/product-fallback.svg"));
}

const template = await readFile("dist/index.html", "utf8");
const origin = process.env.SITE_URL || DEFAULT_ORIGIN;
for (const path of [...publicRoutes, "/404.html"]) {
  const { html } = render(path, template, { origin, noindex: true });
  const file = path === "/404.html" ? "dist/404.html" : `dist${path}index.html`;
  await mkdir(file.substring(0, file.lastIndexOf("/")), { recursive: true });
  await writeFile(file, html);
}
await writeFile("dist/robots.txt", robotsTxt(origin, true));
console.log(
  `Staging preview: ${publicRoutes.length + 1} pages written (noindex). Use npm start for production SSR.`,
);
