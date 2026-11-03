import { ArrowUpRight } from "lucide-react";
import t from "../locales/en.json";
import { sitePath } from "../sitePath";
import { products, type Product } from "../catalog";
import {
  Breadcrumb,
  EnquiryBand,
  ProductCard,
  ProductImage,
  WhatsAppLink,
} from "../components/UI";
export function ProductDetail({ product: p }: { product: Product }) {
  const related = products
    .filter((x) => x.family === p.family && x.id !== p.id)
    .slice(0, 3);
  return (
    <>
      <section className="container detail-section">
        <Breadcrumb name={p.name} parent />
        <div className="detail-grid">
          <div>
            <ProductImage
              src={p.image ? sitePath(p.image) : null}
              alt={p.imageAlt}
              className="detail-image"
            />
            {p.image ? (
              <p className="image-caption">{t.product.illustration}</p>
            ) : null}
          </div>
          <div className="detail-summary">
            <h1>{p.name}</h1>
            <p className="metadata">{p.family}</p>
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
            >
              {t.product.enquire}
            </WhatsAppLink>
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
      </section>
      {related.length ? (
        <section className="section related-section">
          <div className="container">
            <div className="section-heading">
              <h2>{t.product.related}</h2>
              <a href={sitePath("/products/")} className="text-link">
                {t.actions.all}
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
