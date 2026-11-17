import { useState } from "react";
import { ArrowUpRight, MapPin, Phone, Mail } from "lucide-react";
import company from "../data/company.json";
import t from "../locales/en.json";
import { products, whatsappUrl } from "../catalog";
import { Breadcrumb } from "../components/UI";
import { sitePath } from "../sitePath";
export function Contact() {
  const [error, setError] = useState("");
  return (
    <>
      <section className="page-intro container">
        <Breadcrumb name={t.common.contact} />
        <div className="section-heading">
          <h1>{t.contact.title}</h1>
          <p>{t.contact.intro}</p>
        </div>
      </section>
      <section className="contact-grid container">
        <div className="contact-info">
          <h2>{t.contact.address}</h2>
          <a href={`tel:+${company.phoneDigits}`}>
            <Phone size={22} />
            <span>
              <small>{t.contact.call}</small>
              {company.phone}
            </span>
            <ArrowUpRight size={18} />
          </a>
          <a href={`mailto:${company.email}`}>
            <Mail size={22} />
            <span>
              <small>{t.contact.email}</small>
              {company.email}
            </span>
            <ArrowUpRight size={18} />
          </a>
          <div className="address-block">
            <MapPin size={22} />
            <p>
              <strong>{t.contact.showroom}</strong> {company.address}
            </p>
          </div>
          <div className="address-block">
            <MapPin size={22} />
            <p>
              <strong>{t.contact.factory}</strong> {company.factoryAddress}
            </p>
          </div>
          <div className="contact-mark" aria-hidden="true">
            <img
              src={sitePath("/images/logo.webp")}
              alt=""
              width="152"
              height="64"
              loading="lazy"
            />
            <span style={{ whiteSpace: "pre-line" }}>
              {t.common.contactMark}
            </span>
          </div>
        </div>
        <form
          className="enquiry-form"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            if (!form.reportValidity()) {
              setError(t.contact.error);
              return;
            }
            const data = new FormData(form);
            const message = [
              t.messages.intro.replace(
                "{name}",
                String(data.get("name")).trim(),
              ),
              data.get("company")
                ? t.messages.company.replace(
                    "{value}",
                    String(data.get("company")),
                  )
                : "",
              data.get("phone")
                ? t.messages.phone.replace("{value}", String(data.get("phone")))
                : "",
              data.get("product")
                ? t.messages.productField.replace(
                    "{value}",
                    String(data.get("product")),
                  )
                : "",
              t.messages.requirements.replace(
                "{value}",
                String(data.get("message")).trim(),
              ),
            ]
              .filter(Boolean)
              .join("\n");
            const missing = ["name", "phone", "company", "message"].find(
              (field) => !String(data.get(field) ?? "").trim(),
            );
            if (missing) {
              setError(t.contact.error);
              form.querySelector<HTMLElement>(`[name="${missing}"]`)?.focus();
              return;
            }
            setError("");
            window.open(
              whatsappUrl(company.phoneDigits, message),
              "_blank",
              "noopener,noreferrer",
            );
          }}
        >
          <h2>{t.contact.formTitle}</h2>
          <p>{t.contact.handoff}</p>
          <div className="form-grid">
            <label>
              {t.contact.name}
              <span className="required">{t.contact.required}</span>
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                aria-describedby={error ? "form-error" : undefined}
              />
            </label>
            <label>
              {t.contact.phone}
              <span className="required">{t.contact.required}</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                maxLength={40}
                aria-describedby={error ? "form-error" : undefined}
              />
            </label>
          </div>
          <label>
            {t.contact.company}
            <span className="required">{t.contact.required}</span>
            <input
              name="company"
              autoComplete="organization"
              required
              maxLength={160}
              aria-describedby={error ? "form-error" : undefined}
            />
          </label>
          <label>
            {t.contact.product}
            <select name="product" defaultValue="">
              <option value="">{t.contact.choose}</option>
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.contact.message}
            <span className="required">{t.contact.required}</span>
            <textarea
              name="message"
              rows={5}
              required
              maxLength={2000}
              aria-describedby={`message-hint${error ? " form-error" : ""}`}
            />
          </label>
          <p id="message-hint" className="field-hint">
            {t.contact.messageHint}
          </p>
          {error ? (
            <p role="alert" id="form-error" className="form-error">
              {error}
            </p>
          ) : null}
          <button className="button button-green" type="submit">
            {t.contact.submit}
            <ArrowUpRight size={18} />
          </button>
          <p className="field-hint privacy">{t.contact.privacy}</p>
          <noscript>
            <p>{t.contact.noJs}</p>
          </noscript>
        </form>
      </section>
      <section className="map-section container" aria-labelledby="map-title">
        <h2 id="map-title">{t.contact.mapTitle}</h2>
        <div className="map-grid">
          <figure className="map-item">
            <figcaption>{t.contact.showroomMap}</figcaption>
            <div className="map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3626.458622506575!2d46.7212812!3d24.642337399999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f050928dd86db%3A0x3c9aecf6046a23b7!2sOSOS%20AL%20BENAA%20COMPANY%20FOR%20METAL%20INDUSTRI!5e0!3m2!1sen!2sae!4v1794471394650!5m2!1sen!2sae"
                title={t.contact.mapLabel}
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </figure>
          <figure className="map-item">
            <figcaption>{t.contact.factoryMap}</figcaption>
            <div className="map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d26257.65893719992!2d46.8455687!3d24.6251598!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2fa74c685e873b%3A0x6d8920bcde960097!2sOsos%20al%20Benna%20Company%20For%20Metal%20Industries%20%26%20cable%20tray%20(support%20system)!5e0!3m2!1sen!2sae!4v1794898687097!5m2!1sen!2sae"
                title={t.contact.factoryMapLabel}
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </figure>
        </div>
      </section>
    </>
  );
}
