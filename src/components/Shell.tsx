import { useState } from "react";
import { Menu, X, ArrowUpRight, Phone, MapPin } from "lucide-react";
import company from "../data/company.json";
import site from "../data/site.json";
import t from "../locales/en.json";
import { sitePath } from "../sitePath";
export function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip-link" href="#main">
        {t.nav.skip}
      </a>
      <div className="utility">
        <div className="container">
          <span>{company.legalName}</span>
          <a href={`tel:+${company.phoneDigits}`}>
            <Phone size={16} />
            {company.phone}
          </a>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <a
            href={sitePath("/")}
            className="brand"
            aria-label={`${company.name} ${t.common.homeLink}`}
          >
            <img
              src={sitePath("/images/logo.webp")}
              alt={t.common.logoAlt}
              width="280"
              height="122"
            />
            <span>
              {company.wordmark}
              <small>{t.common.brandTagline}</small>
            </span>
          </a>
          <button
            className="icon-button menu-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? t.nav.close : t.nav.open}
            onClick={() => setOpen(!open)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav
            id="site-nav"
            className={open ? "main-nav is-open" : "main-nav"}
            aria-label={t.common.mainNavigation}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                document
                  .querySelector<HTMLButtonElement>(".menu-toggle")
                  ?.focus();
              }
            }}
          >
            {site.nav.map((n) => (
              <a
                key={n.href}
                href={sitePath(n.href)}
                aria-current={
                  (n.href === "/" ? path === "/" : path.startsWith(n.href))
                    ? "page"
                    : undefined
                }
              >
                {n.label}
              </a>
            ))}
            <a className="button button-small" href={sitePath("/contact/")}>
              {t.actions.contact}
              <ArrowUpRight size={16} />
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a
              href={sitePath("/")}
              className="footer-brand"
              aria-label={`${company.name} ${t.common.homeLink}`}
            >
              <img
                src={sitePath("/images/logo.webp")}
                alt={t.common.logoAlt}
                width="280"
                height="122"
                loading="lazy"
              />
            </a>
            <p className="footer-company">{t.footer.company}</p>
            <p>{t.footer.description}</p>
          </div>
          <div>
            <h2>{t.footer.navigation}</h2>
            {site.nav.map((n) => (
              <a key={n.href} href={sitePath(n.href)}>
                {n.label}
              </a>
            ))}
          </div>
          <div>
            <h2>{t.footer.contact}</h2>
            <a href={`tel:+${company.phoneDigits}`}>{company.phone}</a>
            <a href={`mailto:${company.email}`}>{company.email}</a>
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
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {site.copyrightYear} {t.footer.copyright}
          </p>
          <p>{t.footer.note}</p>
        </div>
      </div>
    </footer>
  );
}
