import { ArrowUpRight, Check } from "lucide-react";
import company from "../data/company.json";
import t from "../locales/en.json";
import { sitePath } from "../sitePath";
import {
  Breadcrumb,
  EnquiryBand,
  TitleBlock,
  WhatsAppLink,
} from "../components/UI";
export function About() {
  return (
    <>
      <section className="page-intro container">
        <Breadcrumb name={t.common.about} />
        <div className="section-heading">
          <TitleBlock lead={t.about.h1Lead} title={t.about.title} />
          <p>{t.about.intro}</p>
        </div>
      </section>
      <section className="about-panel container">
        <figure>
          <img
            src={sitePath("/images/system.webp")}
            srcSet={`${sitePath("/images/system-480.webp")} 480w, ${sitePath("/images/system.webp")} 1186w`}
            sizes="(max-width: 899px) 100vw, 50vw"
            alt={t.images.systemAlt}
            width="1186"
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
            <h3>{c.title}</h3>
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
