import { Download, ExternalLink } from "lucide-react";
import t from "../locales/en.json";
import { sitePath } from "../sitePath";
import { Breadcrumb } from "../components/UI";
const pdf = "/osos-al-benaa-catalogue.pdf";
export function CataloguePage() {
  return (
    <>
      <section className="page-intro container">
        <Breadcrumb name={t.common.catalogue} />
        <div className="section-heading">
          <h1>{t.common.catalogue}</h1>
          <p>{t.catalogue.intro}</p>
        </div>
      </section>
      <section className="container catalogue-section">
        <div className="catalogue-card">
          <a
            href={sitePath(pdf)}
            target="_blank"
            rel="noopener"
            className="catalogue-cover"
            aria-label={t.catalogue.view}
          >
            <img
              src={sitePath("/images/catalogue-cover.webp")}
              alt={t.catalogue.coverAlt}
              width="700"
              height="990"
            />
          </a>
          <div className="catalogue-info">
            <h2>{t.catalogue.title}</h2>
            <p>{t.catalogue.body}</p>
            <p className="metadata">{t.catalogue.meta}</p>
            <div className="catalogue-actions">
              <a
                className="button"
                href={sitePath(pdf)}
                target="_blank"
                rel="noopener"
              >
                {t.catalogue.view}
                <ExternalLink size={18} />
              </a>
              <a
                className="button button-outline"
                href={sitePath(pdf)}
                download="Osos-Al-Benaa-Catalogue.pdf"
              >
                {t.catalogue.download}
                <Download size={18} />
              </a>
            </div>
          </div>
        </div>
        <div className="catalogue-viewer">
          <iframe
            src={sitePath(pdf) + "#view=FitH"}
            title={t.catalogue.title}
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}
