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
