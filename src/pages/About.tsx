import { ArrowUpRight, Check } from "lucide-react";
import company from "../data/company.json";
import t from "../locales/en.json";
import { sitePath } from "../sitePath";
import { Breadcrumb, EnquiryBand, WhatsAppLink } from "../components/UI";
export function About() {
  return (
    <>
      <section className="page-intro container">
        <Breadcrumb name={t.common.about} />
        <div className="section-heading">
          <h1>{t.about.title}</h1>
          <p>{t.about.intro}</p>
        </div>
      </section>
      <section className="about-panel container">
        <figure>
          <img
            src={sitePath("/images/system.webp")}
            alt={t.images.systemAlt}
            width="1200"
            height="900"
          />
          <figcaption>{t.about.drawingCaption}</figcaption>
        </figure>
        <div>
          <h2>{t.about.scopeTitle}</h2>
          <p>{company.about}</p>
          <p>{company.intro}</p>
          <WhatsAppLink />
        </div>
      </section>
      <section className="section container capability-list">
        {company.capabilities.map((c) => (
          <article key={c.title}>
            <h2>{c.title}</h2>
            <p>{c.body}</p>
            <ArrowUpRight size={26} aria-hidden="true" />
          </article>
        ))}
      </section>
      <section className="section applications">
        <div className="container">
          <div className="section-heading">
            <h2>{t.about.applicationsTitle}</h2>
            <p>{t.about.applicationsIntro}</p>
          </div>
          <ul>
            {company.applications.map((a) => (
              <li key={a}>
                <Check size={19} />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
