// Production server: genuine server-side rendering for every public page.
// Run `npm run build` first, then `npm start`.
import express from "express";
import compression from "compression";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const clientDir = join(root, "dist");
const { render, canonicalPathFor, robotsTxt, sitemapXml, DEFAULT_ORIGIN } =
  await import(join(root, "dist-server", "entry-server.js"));

// Inline the (small) stylesheet so first paint does not wait for a CSS request.
const template = readFileSync(join(clientDir, "index.html"), "utf8").replace(
  /<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/,
  (_tag, file) =>
    `<style>${readFileSync(join(clientDir, file), "utf8")}</style>`,
);
const ORIGIN = (process.env.SITE_URL || DEFAULT_ORIGIN).replace(/\/$/, "");
const CANONICAL_HOST = new URL(ORIGIN).host;
// Redirect www and plain HTTP to the preferred origin. Only hosts we know are
// redirected, so a host's preview URL keeps working, and HTTP is detected from
// the proxy's X-Forwarded-Proto header so a proxy that hides it can't loop.
const ENFORCE_ORIGIN = process.env.ENFORCE_CANONICAL_ORIGIN !== "false";
const NOINDEX = process.env.NOINDEX === "true"; // for staging deployments
const LASTMOD = new Date(
  process.env.SITEMAP_LASTMOD || statSync(join(clientDir, "index.html")).mtime,
)
  .toISOString()
  .slice(0, 10);

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(compression());

app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "")
    .toString()
    .split(",")[0]
    .trim()
    .toLowerCase();
  const proto = (req.headers["x-forwarded-proto"] || (req.secure ? "https" : ""))
    .toString()
    .split(",")[0]
    .trim();
  if (proto === "https" && host === CANONICAL_HOST && !NOINDEX)
    res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (NOINDEX) res.set("X-Robots-Tag", "noindex, nofollow");
  if (
    ENFORCE_ORIGIN &&
    (host === "www." + CANONICAL_HOST ||
      (host === CANONICAL_HOST && proto === "http"))
  ) {
    const target = canonicalPathFor(req.path) ?? req.path;
    const query = req.originalUrl.slice(req.path.length);
    return res.redirect(301, ORIGIN + target + query);
  }
  next();
});

// Static files: hashed bundles are immutable; images and PDFs cache for a while.
const serveStatic = express.static(clientDir, {
  index: false,
  redirect: false,
  setHeaders(res, file) {
    if (file.includes(`${join("dist", "assets")}`))
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    else if (/\.(webp|avif|png|jpe?g|svg|ico)$/.test(file))
      res.set("Cache-Control", "public, max-age=2592000");
    else if (file.endsWith(".pdf"))
      res.set("Cache-Control", "public, max-age=86400");
    else res.set("Cache-Control", "public, max-age=3600");
  },
});
// HTML is never served from disk: every page is rendered per request below.
app.use((req, res, next) =>
  /\.html?$/i.test(req.path) ? next() : serveStatic(req, res, next),
);

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").set("Cache-Control", "public, max-age=3600");
  res.send(robotsTxt(ORIGIN, NOINDEX));
});

app.get("/sitemap.xml", (_req, res) => {
  res.type("application/xml").set("Cache-Control", "public, max-age=3600");
  res.send(sitemapXml(ORIGIN, LASTMOD));
});

app.get("*", (req, res) => {
  // One 301 hop to the canonical lowercase, trailing-slash URL.
  const target = canonicalPathFor(req.path);
  if (target) {
    const query = req.originalUrl.slice(req.path.length);
    return res.redirect(301, target + query);
  }
  try {
    const { status, html } = render(req.path, template, {
      origin: ORIGIN,
      noindex: NOINDEX,
    });
    res
      .status(status)
      .type("html")
      .set("Cache-Control", "public, max-age=0, must-revalidate")
      .send(html);
  } catch (error) {
    console.error(error);
    res.status(500).type("text/plain").send("Internal Server Error");
  }
});

// Anything other than GET/HEAD on a page.
app.all("*", (_req, res) => res.status(405).set("Allow", "GET, HEAD").end());

const port = Number(process.env.PORT || 3000);
app.listen(port, () =>
  console.log(`OBC website (SSR) on http://localhost:${port} → ${ORIGIN}`),
);
