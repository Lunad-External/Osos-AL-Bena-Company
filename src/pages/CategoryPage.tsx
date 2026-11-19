import t from "../locales/en.json";
import { sitePath } from "../sitePath";
import { products } from "../catalog";
import { families, categoryPath, type Family } from "../seo";
import { Breadcrumb, EnquiryBand, ProductCard } from "../components/UI";

/** A product range (family) with its own content and product list. */
export function CategoryPage({ family }: { family: Family }) {
  const list = products.filter((p) => p.family === family.name);
  const others = families.filter((f) => f.slug !== family.slug);
  return (
    <>
      <section className="page-intro container">
        <Breadcrumb name={family.name} parent />
        <div className="section-heading">
          <h1>{family.name}</h1>
          <div className="category-intro">
            {family.intro.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        </div>
        <nav className="range-links" aria-label={t.category.otherRanges}>
          <p className="range-links-title">{t.category.otherRanges}</p>
          <ul>
            {others.map((f) => (
              <li key={f.slug}>
                <a href={sitePath(categoryPath(f))}>{f.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <section className="section container category-products">
        <h2>
          {t.category.productsTitle.replace("{count}", String(list.length))}
        </h2>
        <div className="product-grid">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
