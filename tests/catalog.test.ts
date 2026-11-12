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
test("source rows retained, identities unique and removed product absent", () => {
  assert.equal(products.length, 40);
  assert.equal(new Set(products.map((p) => p.slug)).size, 40);
  assert.deepEqual(
    products.map((p) => p.source.row),
    Array.from({ length: 40 }, (_, i) => i + 2),
  );
  assert.ok(products.every((p) => p.slug !== "nylon-two-bolt-cable-cleat-type-ntc"));
});
test("search handles terms, model, part number and no results", () => {
  assert.equal(filterProducts(" TYPE-TF ", emptyFilters()).length, 1);
  assert.equal(filterProducts("S-C1", emptyFilters()).length, 1);
  assert.equal(filterProducts("horizontal 90", emptyFilters()).length, 2);
  assert.equal(filterProducts("unobtainium", emptyFilters()).length, 0);
});
test("facets OR internally and AND across facets", () => {
  const f = { ...emptyFilters(), family: ["Cable trunking", "Cable baskets"] };
  assert.equal(filterProducts("", f).length, 5);
  assert.equal(filterProducts("", { ...f, brand: ["OBC"] }).length, 5);
  assert.equal(filterProducts("basket", { ...f, brand: ["OBC"] }).length, 2);
  assert.equal(filterProducts("", { ...f, material: ["Nylon 06 Glass-filled (LSOH/LSZH)"] }).length, 0);
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
