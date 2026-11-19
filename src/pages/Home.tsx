import { ArrowUpRight } from "lucide-react";
import { HeroSlider } from "../components/HeroSlider";
import company from "../data/company.json";
import site from "../data/site.json";
import t from "../locales/en.json";
import { products, type Product } from "../catalog";
import { families, categoryPath } from "../seo";
import { sitePath } from "../sitePath";
import { EnquiryBand, ProductCard } from "../components/UI";
export function Home() {
  return (
    <>
      <HeroSlider />
      <section className="range-section section">
        <div className="container">
          <div className="section-heading">
            <h2>{t.home.rangeTitle}</h2>
            <p>{t.home.rangeIntro}</p>
          </div>
          <div className="family-grid">
            {families.map((f, i) => (
              <a
                className={`family-card family-${i}`}
                href={sitePath(categoryPath(f))}
                key={f.name}
              >
                <div className="family-image">
                  <img
                    src={sitePath(f.image || "/images/product-fallback.svg")}
                    srcSet={
                      f.image && f.imageWidth && f.imageWidth > 480
                        ? `${sitePath(f.image.replace(/\.webp$/, "-480.webp"))} 480w, ${sitePath(f.image)} ${f.imageWidth}w`
                        : undefined
                    }
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px"
                    alt={f.name}
                    width={f.imageWidth ?? 600}
                    height={f.imageHeight ?? 450}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h3>{f.short}</h3>
                  <ArrowUpRight size={24} />
                </div>
                <p>{f.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="section company-section container">
        <div className="company-visual">
          <img
            src={sitePath("/images/system.webp")}
            srcSet={`${sitePath("/images/system-480.webp")} 480w, ${sitePath("/images/system.webp")} 1186w`}
            sizes="(max-width: 899px) 100vw, 50vw"
            alt={t.images.systemAlt}
            width="1186"
            height="900"
            loading="lazy"
            decoding="async"
          />
          <span>{company.legalName}</span>
        </div>
        <div className="company-copy">
          <h2>{t.home.aboutTitle}</h2>
          <p>{company.intro}</p>
          <p>{company.about}</p>
          <a className="text-link" href={sitePath("/about/")}>
            {t.home.aboutLink}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="section featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>{t.home.featuredTitle}</h2>
              <p>{t.home.featuredIntro}</p>
            </div>
            <a className="text-link" href={sitePath("/products/")}>
              {t.actions.all}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="featured-grid">
            {site.featuredIds
              .map((id) => products.find((p) => p.id === id))
              .filter((p): p is Product => !!p)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
