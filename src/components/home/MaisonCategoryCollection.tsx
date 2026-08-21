import Image from "next/image";
import Link from "next/link";
import { withImageParams } from "@/lib/image";
import type { Category } from "@/components/CategoryCard";

export default function MaisonCategoryCollection({ items }: { items: Category[] }) {
  if (!items.length) return null;
  return (
    <div className="ma-category-grid">
      {items.slice(0, 3).map((category) => (
        <Link key={category.href} href={category.href} className="ma-category-card">
          <Image src={withImageParams(category.image, "auto=format&fit=crop&w=1200&q=88")} alt={category.imageAlt || category.name} fill sizes="(max-width: 700px) 78vw, 33vw" className="object-cover" />
          <span className="ma-category-shade" />
          <span className="ma-category-copy"><strong>{category.name}</strong><small>Explore collection →</small></span>
        </Link>
      ))}
    </div>
  );
}
