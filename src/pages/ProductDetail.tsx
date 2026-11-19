import { ArrowUpRight } from "lucide-react";
import t from "../locales/en.json";
import { sitePath } from "../sitePath";
import { products, type Product } from "../catalog";
import { familyOf, categoryPath, locations, locationPath } from "../seo";
import {
  Breadcrumb,
  EnquiryBand,
  ProductCard,
  ProductImage,
  WhatsAppLink,
} from "../components/UI";
export function ProductDetail({ product: p }: { product: Product }) {
  const family = familyOf(p);
  const fill = (text: string, values: Record<string, string>) =>
    text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
  const finishNotes = t.finishes as Record<string, string>;
  const finishes = p.finishes.filter((f) => f in finishNotes);
  const related = products
    .filter((x) => x.family === p.family && x.id !== p.id)
    .slice(0, 3);
  return (
    <>
      <section className="container detail-section">
        <Breadcrumb
          name={p.name}
          parent
          trail={
            family ? [{ name: family.name, href: categoryPath(family) }] : []
          }
        />
        <div className="detail-grid">
          <div>
            <ProductImage
              src={p.image}
              alt={p.imageAlt}
              className="detail-image"
              width={p.imageWidth}
              height={p.imageHeight}
              sizes="(max-width: 899px) 100vw, 50vw"
              priority
            />
            {p.image ? (
              <p className="image-caption">{t.product.illustration}</p>
            ) : null}
          </div>
          <div className="detail-summary">
            <h1>{(p as { seoName?: string }).seoName ?? p.name}</h1>
            <p className="metadata">
              {family ? (
                <a href={sitePath(categoryPath(family))}>{family.name}</a>
              ) : (
                p.family
              )}
            </p>
            <p>{p.description || t.product.descriptionFallback}</p>
            <dl className="identity-list">
              <div>
                <dt>{t.product.manufacturer}</dt>
                <dd>{p.manufacturer}</dd>
              </div>
              <div>
                <dt>{t.product.origin}</dt>
                <dd>{p.origin}</dd>
              </div>
              <div>
                <dt>{t.product.brand}</dt>
                <dd>{p.brand}</dd>
              </div>
            </dl>
            <WhatsAppLink
              message={t.messages.product.replace(
                "{product}",
                p.name + (p.model ? " (" + p.model + ")" : ""),
              )}
            />
          </div>
        </div>
        <div className="spec-section">
          <h2>{t.product.specs}</h2>
          <dl className="spec-list">
            {Object.entries({
              [t.product.model]: p.model,
              [t.product.partNumber]: p.partNumber,
              [t.product.material]: p.material,
              [t.product.finish]: p.finishes.join(", "),
              ...p.specifications,
            }).map(([key, value]) =>
              value ? (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
          <p className="spec-note">{t.product.missing}</p>
        </div>
        <div className="product-overview">
          <h2>{t.product.overviewTitle}</h2>
          <div className="overview-copy">
            <p>
              {fill(t.product.overview, {
                name: p.name,
                family: (family?.name ?? p.family).toLowerCase(),
              })}
              {p.material
                ? " " +
                  fill(t.product.madeOf, { material: p.material.toLowerCase() })
                : ""}
              {p.model ? ` ${t.product.model}: ${p.model}.` : ""}
              {p.specifications?.Standard
                ? " " +
                  fill(t.product.standards, {
                    standard: p.specifications.Standard,
                  })
                : ""}
            </p>
            {family ? <p>{family.intro[0]}</p> : null}
            {finishes.length ? (
              <>
                <h3>{t.product.finishesTitle}</h3>
                <dl className="finish-list">
                  {finishes.map((f) => (
                    <div key={f}>
                      <dt>{f}</dt>
                      <dd>{finishNotes[f]}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
            <h3>{t.product.orderTitle}</h3>
            <p>
              {t.product.order}{" "}
              {locations.map((l, i) => (
                <span key={l.slug}>
                  {i === 0
                    ? ""
                    : i === locations.length - 1
                      ? ` ${t.product.and} `
                      : ", "}
                  <a href={sitePath(locationPath(l))}>{l.label}</a>
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      </section>
      {related.length ? (
        <section className="section related-section">
          <div className="container">
            <div className="section-heading">
              <h2>{t.product.related}</h2>
              <a
                href={sitePath(family ? categoryPath(family) : "/products/")}
                className="text-link"
              >
                {family
                  ? fill(t.category.viewAll, {
                      range: family.short.toLowerCase(),
                    })
                  : t.actions.all}
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="product-grid">
              {related.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <EnquiryBand />
    </>
  );
}
