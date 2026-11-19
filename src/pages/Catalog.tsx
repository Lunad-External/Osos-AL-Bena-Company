import { useEffect, useRef, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import company from "../data/company.json";
import t from "../locales/en.json";
import {
  filterProducts,
  readSelection,
  selectionUrl,
  emptyFilters,
  facetKeys,
  options,
  type Filters,
  type Facet,
} from "../catalog";
import {
  Breadcrumb,
  EnquiryBand,
  ProductCard,
  TitleBlock,
} from "../components/UI";
import { families, categoryPath } from "../seo";
import { sitePath } from "../sitePath";
function Facets({
  filters,
  toggle,
}: {
  filters: Filters;
  toggle: (key: Facet, value: string) => void;
}) {
  return (
    <>
      {facetKeys.map((key) => (
        <fieldset key={key}>
          <legend>{t.catalog[key]}</legend>
          {options[key].map((value) => (
            <label className="check-label" key={value}>
              <input
                type="checkbox"
                checked={filters[key].includes(value)}
                onChange={() => toggle(key, value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </fieldset>
      ))}
    </>
  );
}
export function Catalog() {
  const [query, setQuery] = useState(""),
    [filters, setFilters] = useState<Filters>(emptyFilters),
    [enhanced, setEnhanced] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const restore = () => {
      const s = readSelection(window.location.search);
      setQuery(s.query);
      setFilters(s.filters);
    };
    restore();
    setEnhanced(true);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  function update(q: string, f: Filters, replace = false) {
    setQuery(q);
    setFilters(f);
    window.history[replace ? "replaceState" : "pushState"](
      {},
      "",
      sitePath(selectionUrl(q, f)),
    );
  }
  const toggle = (key: Facet, value: string) =>
    update(query, {
      ...filters,
      [key]: filters[key].includes(value)
        ? filters[key].filter((x) => x !== value)
        : [...filters[key], value],
    });
  const found = filterProducts(query, filters),
    active = facetKeys.flatMap((key) =>
      filters[key].map((value) => ({ key, value })),
    );
  const close = () => {
    dialog.current?.close();
    returnFocus.current?.focus();
  };
  return (
    <>
      <section className="page-intro container">
        <Breadcrumb name={t.common.products} />
        <TitleBlock lead={t.catalog.h1Lead} title={t.catalog.title} />
        <p>{t.catalog.intro}</p>
        <nav className="range-links" aria-label={t.catalog.rangesTitle}>
          <p className="range-links-title">{t.catalog.rangesTitle}</p>
          <ul>
            {families.map((f) => (
              <li key={f.slug}>
                <a href={sitePath(categoryPath(f))}>{f.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <section className="catalog-section container">
        <div className="search-row">
          <div className="search-box">
            <Search size={22} aria-hidden="true" />
            <label className="sr-only" htmlFor="product-search">
              {t.catalog.search}
            </label>
            <input
              id="product-search"
              type="search"
              placeholder={t.catalog.placeholder}
              value={query}
              disabled={!enhanced}
              onChange={(e) => update(e.target.value, filters, true)}
            />
            {query ? (
              <button
                className="icon-button"
                onClick={() => update("", filters)}
                aria-label={t.catalog.clearSearch}
              >
                <X size={20} />
              </button>
            ) : null}
          </div>
          <button
            className="button button-outline filter-trigger"
            ref={returnFocus}
            onClick={() => dialog.current?.showModal()}
          >
            <SlidersHorizontal size={18} />
            {t.catalog.filters}
            {active.length ? ` (${active.length})` : ""}
          </button>
        </div>
        <noscript>
          <p>{t.catalog.noJs}</p>
        </noscript>
        <div className="catalog-layout">
          <aside className="filter-rail" aria-label={t.catalog.filters}>
            <div className="filter-heading">
              <h2>{t.catalog.filters}</h2>
              {active.length || query ? (
                <button
                  className="link-button"
                  onClick={() => update("", emptyFilters())}
                >
                  {t.catalog.clear}
                </button>
              ) : null}
            </div>
            <Facets filters={filters} toggle={toggle} />
          </aside>
          <div className="catalog-results">
            <div className="results-bar">
              <p aria-live="polite" aria-atomic="true">
                <strong>{found.length}</strong> {t.catalog.results}
              </p>
              <span>
                {company.brand} / {t.catalog.title.replace(".", "")}
              </span>
            </div>
            {active.length ? (
              <div className="active-pills" aria-label={t.catalog.selected}>
                {active.map(({ key, value }) => (
                  <button
                    key={key + value}
                    className="filter-pill"
                    onClick={() => toggle(key, value)}
                    aria-label={`${t.catalog.remove} ${t.catalog[key]} ${value}`}
                  >
                    {t.catalog[key]}: {value}
                    <X size={15} />
                  </button>
                ))}
                <button
                  className="link-button"
                  onClick={() => update("", emptyFilters())}
                >
                  {t.catalog.clear}
                </button>
              </div>
            ) : null}
            {found.length ? (
              <>
                <h2 className="sr-only">{t.catalog.listHeading}</h2>
                <div className="product-grid">
                  {found.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Search size={36} />
                <h2>{t.catalog.emptyTitle}</h2>
                <p>{t.catalog.emptyBody}</p>
                <button
                  className="button"
                  onClick={() => update("", emptyFilters())}
                >
                  {t.catalog.clear}
                </button>
              </div>
            )}
          </div>
        </div>
        <dialog
          className="filter-dialog"
          aria-labelledby="filter-dialog-title"
          ref={dialog}
          onClose={() => returnFocus.current?.focus()}
        >
          <div className="dialog-heading">
            <p className="dialog-title" id="filter-dialog-title">
              {t.catalog.dialogTitle}
            </p>
            <button
              className="icon-button"
              aria-label={t.catalog.close}
              onClick={close}
            >
              <X />
            </button>
          </div>
          <div className="dialog-content">
            <Facets filters={filters} toggle={toggle} />
          </div>
          <div className="dialog-actions">
            <button
              className="link-button"
              onClick={() => update("", emptyFilters())}
            >
              {t.catalog.clear}
            </button>
            <button className="button" onClick={close}>
              {t.catalog.show} ({found.length})
            </button>
          </div>
        </dialog>
      </section>
      <EnquiryBand />
    </>
  );
}
