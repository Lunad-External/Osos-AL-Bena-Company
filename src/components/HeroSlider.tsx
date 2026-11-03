import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import site from "../data/site.json";
import t from "../locales/en.json";
import { sitePath, siteSrcSet } from "../sitePath";

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const slides = site.heroSlides;
  const move = (direction: number) =>
    setActive(
      (current) => (current + direction + slides.length) % slides.length,
    );
  return (
    <section
      className="home-hero"
      aria-roledescription="carousel"
      aria-label={t.home.sliderLabel}
    >
      <div className="hero-images" aria-hidden="true">
        {slides.map((slide, index) =>
          index === 0 || index === active ? (
            <picture key={slide.image}>
              <source
                type="image/avif"
                srcSet={siteSrcSet(slide.avifSrcSet)}
                sizes="100vw"
              />
              <img
                className={
                  index === active ? "hero-slide is-active" : "hero-slide"
                }
                src={sitePath(slide.image)}
                srcSet={siteSrcSet(slide.srcSet)}
                sizes="100vw"
                alt=""
                width="1440"
                height="960"
                fetchPriority={index === 0 ? "high" : "low"}
                decoding="async"
              />
            </picture>
          ) : null,
        )}
      </div>
      <div className="hero-overlay" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>{t.home.title}</h1>
          <p>{t.home.intro}</p>
          <div className="hero-actions">
            <a className="button" href={sitePath("/products/")}>
              {t.actions.explore}
              <ArrowUpRight size={20} />
            </a>
            <a className="button button-white" href={sitePath("/about/")}>
              {t.home.aboutLink}
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="hero-origin">
            <MapPin size={16} />
            <span>{t.home.location}</span>
            <span className="origin-line" />
            <span>{t.home.since}</span>
          </div>
        </div>
        <div className="hero-bottom">
          <p className="hero-caption">{t.home.imageCaption}</p>
          <div className="hero-controls">
            <button
              className="hero-control"
              aria-label={t.home.previousSlide}
              onClick={() => move(-1)}
            >
              <ChevronLeft size={20} />
            </button>
            <span
              className="hero-slide-count"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="sr-only">{t.home.slide} </span>
              {active + 1} / {slides.length}
            </span>
            <button
              className="hero-control"
              aria-label={t.home.nextSlide}
              onClick={() => move(1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
