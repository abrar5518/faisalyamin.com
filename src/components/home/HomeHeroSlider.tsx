"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type HomeHeroSlideData = {
  id?: number;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  primaryLabel?: string | null;
  primaryHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
  desktopImage: string;
  mobileImage?: string | null;
  imageAlt?: string | null;
  backgroundColor?: string | null;
  accentColor?: string | null;
  badgeText?: string | null;
};

type Props = {
  slides: HomeHeroSlideData[];
  autoPlay?: boolean;
  intervalMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
};

export default function HomeHeroSlider({
  slides,
  autoPlay = true,
  intervalMs = 5000,
  showArrows = true,
  showDots = true,
}: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const safeInterval = Math.min(20000, Math.max(2000, intervalMs));

  const show = useCallback(
    (index: number) => {
      if (!slides.length) return;
      setActive((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (!autoPlay || paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, safeInterval);
    return () => window.clearInterval(timer);
  }, [autoPlay, paused, safeInterval, slides.length]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  if (!slides.length) return null;

  return (
    <section
      className="ma-hero"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current == null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 45) return;
        show(active + (delta < 0 ? 1 : -1));
      }}
    >
      <div className="ma-hero-stage">
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <article
              key={slide.id ?? `${slide.title}-${index}`}
              className={`ma-hero-slide${isActive ? " is-active" : ""}`}
              style={{
                "--ma-hero-bg": slide.backgroundColor || "#f5efe6",
                "--ma-hero-accent": slide.accentColor || "#b36f49",
              } as React.CSSProperties}
              aria-hidden={!isActive}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
            >
              <div className="ma-hero-copy">
                {slide.eyebrow ? <p className="ma-hero-eyebrow">{slide.eyebrow}</p> : null}
                <h1>{slide.title}</h1>
                {slide.description ? <p className="ma-hero-description">{slide.description}</p> : null}
                <div className="ma-hero-actions">
                  {slide.primaryLabel && slide.primaryHref ? (
                    <Link className="ma-hero-primary" href={slide.primaryHref} tabIndex={isActive ? 0 : -1}>
                      {slide.primaryLabel}
                    </Link>
                  ) : null}
                  {slide.secondaryLabel && slide.secondaryHref ? (
                    <Link className="ma-hero-secondary" href={slide.secondaryHref} tabIndex={isActive ? 0 : -1}>
                      {slide.secondaryLabel}
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="ma-hero-media">
                <picture>
                  {slide.mobileImage ? <source media="(max-width: 700px)" srcSet={slide.mobileImage} /> : null}
                  <img
                    src={slide.desktopImage}
                    alt={slide.imageAlt || ""}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </picture>
                {slide.badgeText ? <span className="ma-hero-badge">{slide.badgeText}</span> : null}
                <span className="ma-hero-index">{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
              </div>
            </article>
          );
        })}

        {slides.length > 1 && (showArrows || showDots) ? (
          <div className="ma-hero-controls">
            {showArrows ? (
              <button type="button" onClick={() => show(active - 1)} aria-label="Previous slide">←</button>
            ) : null}
            {showDots ? (
              <div className="ma-hero-dots" aria-label="Choose slide">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id ?? index}
                    type="button"
                    className={index === active ? "is-active" : ""}
                    onClick={() => show(index)}
                    aria-label={`Show slide ${index + 1}`}
                    aria-current={index === active ? "true" : undefined}
                  />
                ))}
              </div>
            ) : null}
            {showArrows ? (
              <button type="button" onClick={() => show(active + 1)} aria-label="Next slide">→</button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
