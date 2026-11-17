import { test } from "node:test";
import assert from "node:assert/strict";
import {
  products,
  filterProducts,
  emptyFilters,
  readSelection,
  selectionUrl,
  whatsappUrl,
} from "../src/catalog";
test("identities unique and removed products absent", () => {
  assert.equal(products.length, 77);
  assert.equal(new Set(products.map((p) => p.slug)).size, 77);
  assert.equal(new Set(products.map((p) => p.id)).size, 77);
  for (const slug of [
    "nylon-two-bolt-cable-cleat-type-ntc",
    "cable-tray-and-fittings-type-me",
    "cable-tray-fitting-box-connector",
  ])
    assert.ok(products.every((p) => p.slug !== slug));
});
test("search handles terms, model, part number and no results", () => {
  assert.equal(filterProducts(" TYPE-TF ", emptyFilters()).length, 1);
  assert.equal(filterProducts("S-C1", emptyFilters()).length, 1);
  assert.equal(filterProducts("horizontal 90", emptyFilters()).length, 2);
  assert.equal(filterProducts("unobtainium", emptyFilters()).length, 0);
});
test("facets OR internally and AND across facets", () => {
  const f = { ...emptyFilters(), family: ["Cable trunking", "Cable baskets"] };
  assert.equal(filterProducts("", f).length, 19);
  assert.equal(filterProducts("", { ...f, brand: ["OBC"] }).length, 19);
  assert.equal(filterProducts("basket", { ...f, brand: ["OBC"] }).length, 8);
  assert.equal(
    filterProducts("", {
      ...f,
      material: ["Nylon 06 Glass-filled (LSOH/LSZH)"],
    }).length,
    0,
  );
});
test("URL state roundtrips, rejects unknown values and deduplicates", () => {
  const f = {
    ...emptyFilters(),
    family: ["Cable trays & fittings"],
    finish: ["Hot Dip Galvanized"],
  };
  const url = selectionUrl("90 elbow", f);
  assert.deepEqual(readSelection(url.split("?")[1]), {
    query: "90 elbow",
    filters: f,
  });
  assert.deepEqual(
    readSelection("?brand=unknown&brand=OBC&brand=OBC").filters.brand,
    ["OBC"],
  );
});
test("WhatsApp encodes reserved characters and Unicode", () => {
  const message = "Name: A&B + فريق\nSize: 41×41";
  const url = new URL(whatsappUrl("966563702823", message));
  assert.equal(url.searchParams.get("text"), message);
  assert.equal(url.pathname, "/966563702823");
});
test("URL rules: slugs, ampersands, case and trailing slashes", async () => {
  const { slugify, canonicalPathFor, publicRoutes, removedPaths, movedPaths } =
    await import("../src/seo");
  assert.equal(
    slugify("Interior & Exterior Design"),
    "interior-and-exterior-design",
  );
  assert.equal(slugify("Home_Interior"), "home-interior");
  assert.equal(slugify("20% Discount!"), "20-discount");
  assert.equal(slugify("office---interior--design"), "office-interior-design");
  for (const p of products) assert.equal(p.slug, slugify(p.name));
  for (const r of publicRoutes) {
    assert.match(r, /^\/([a-z0-9]+(-[a-z0-9]+)*\/)*$/);
    assert.equal(canonicalPathFor(r), null);
  }
  assert.equal(canonicalPathFor("/About"), "/about/");
  assert.equal(canonicalPathFor("/products"), "/products/");
  assert.equal(canonicalPathFor("/index.html"), "/");
  for (const [from, to] of Object.entries(movedPaths)) {
    assert.equal(canonicalPathFor(from), to);
    assert.ok(publicRoutes.includes(to));
  }
  for (const r of removedPaths) assert.ok(!publicRoutes.includes(r));
});
test("every page has unique metadata and valid structured data", async () => {
  const { pageMeta, publicRoutes, structuredData, sitemapXml } = await import(
    "../src/seo"
  );
  const titles = new Set(),
    descriptions = new Set();
  for (const r of publicRoutes) {
    const meta = pageMeta(r);
    assert.equal(meta.status, 200);
    titles.add(meta.title);
    descriptions.add(meta.description);
    assert.ok(meta.description.length <= 160, r);
    JSON.parse(JSON.stringify(structuredData(meta, "https://ososalbenaa.com")));
  }
  assert.equal(titles.size, publicRoutes.length);
  assert.equal(descriptions.size, publicRoutes.length);
  assert.equal(pageMeta("/missing/").status, 404);
  const xml = sitemapXml("https://ososalbenaa.com", "2026-01-01");
  assert.equal((xml.match(/<loc>/g) || []).length, publicRoutes.length);
});
