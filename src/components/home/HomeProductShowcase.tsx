"use client";

import Link from "next/link";
import { useState } from "react";

export type ShowcaseProduct = {
  id: string;
  name: string;
  price: string;
  label: string;
  image: string;
  href: string;
};

export default function HomeProductShowcase({
  items,
  eyebrow,
  title,
  subtitle,
}: {
  items: ShowcaseProduct[];
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  const [active, setActive] = useState(Math.min(2, items.length - 1));

  return (
    <section className="fan-showcase">
      <div className="fan-heading">
        <span className="fan-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="fan-deck">
        {items.slice(0, 5).map((item, index) => (
          <article
            className={`fan-product${active === index ? " active" : ""}`}
            key={item.id}
            style={{ backgroundImage: `url("${item.image.replace(/"/g, "%22")}")` }}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            <span className="fan-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="fan-info">
              <small>{item.label}</small>
              <h3>{item.name}</h3>
              <span className="fan-price">{item.price}</span>
              <Link href={item.href}>View product</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
