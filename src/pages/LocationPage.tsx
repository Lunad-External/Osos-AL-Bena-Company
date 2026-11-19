import { ArrowUpRight, MapPin } from "lucide-react";
import company from "../data/company.json";
import t from "../locales/en.json";
import { sitePath } from "../sitePath";
import {
  families,
  categoryPath,
  locations,
  locationPath,
  type Location,
} from "../seo";
import { Breadcrumb, EnquiryBand, WhatsAppLink } from "../components/UI";

/** A city landing page: what OBC supplies there and how to order. */
export function LocationPage({ location: l }: { location: Location }) {
  const others = locations.filter((x) => x.slug !== l.slug);
  return (
    <>
      <section className="page-intro container">
        <Breadcrumb name={l.h1} />
        <div className="section-heading">
          <h1>{l.h1}</h1>
          <p>{l.intro}</p>
        </div>
      </section>
      <section className="section container location-body">
        <div className="location-copy">
          {l.sections.map((s) => (
            <div key={s.title}>
              <h2>{s.title}</h2>
              {s.body.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          ))}
          <div>
            <h2>{t.locations.rangesTitle}</h2>
            <ul className="location-ranges">
              {families.map((f) => (
                <li key={f.slug}>
                  <a href={sitePath(categoryPath(f))}>
                    <strong>{f.name}</strong>
                    <span>{f.description}</span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="location-aside">
          <h2>{t.locations.visitTitle}</h2>
          <p>{t.locations.visit}</p>
          <p className="footer-address">
            <MapPin size={16} />
            <span>
              <strong>{t.contact.showroom}</strong> {company.address}
            </span>
          </p>
          <p className="footer-address">
            <MapPin size={16} />
            <span>
              <strong>{t.contact.factory}</strong> {company.factoryAddress}
            </span>
          </p>
          <p>
            <a href={`tel:+${company.phoneDigits}`}>{company.phone}</a>
            <br />
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>
          <WhatsAppLink />
          <p className="location-others">
            {t.locations.otherCities}{" "}
            {others.map((o, i) => (
              <span key={o.slug}>
                {i ? ` ${t.product.and} ` : ""}
                <a href={sitePath(locationPath(o))}>{o.label}</a>
              </span>
            ))}
            .
          </p>
        </aside>
      </section>
      <EnquiryBand />
    </>
  );
}
