import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, itemListSchema } from "@/components/seo/schemas";
import { canonicalUrl } from "@/lib/siteUrl";

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-340 px-5 sm:px-8 lg:px-12">{children}</div>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const shopUrl = canonicalUrl("/shop");
  const title = query ? `Search: ${query}` : "Search water bottles, kids bottles, school bottles...";
  const description = query
    ? `Search results for "${query}" on Sahoolat.`
    : "Search and find the best water bottles online in Pakistan. Discover top products at Sahoolat.";

  return {
    title,
    description,
    alternates: { canonical: shopUrl },
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: shopUrl,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const rows = query
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { slug: { contains: query } },
            { shortDesc: { contains: query } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 60,
        include: { images: true },
      })
    : [];
  const baseUrlResolved = canonicalUrl();
  const pageUrl = canonicalUrl("/shop");
  const items = rows.slice(0, 20).map((p) => ({
    name: p.name ?? "Product",
    url: absoluteUrl(`/product/${p.slug}`, baseUrlResolved),
    image: p.images?.[0]?.url ? absoluteUrl(p.images[0].url, baseUrlResolved) : undefined,
  }));
  const searchResultsSchema = query && items.length > 0
    ? itemListSchema({ url: pageUrl, items })
    : null;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {searchResultsSchema ? <Schema data={searchResultsSchema} /> : null}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-8 items-center justify-between text-xs text-neutral-600 leading-none">
            <p>Search results</p>
            <Link className="hover:text-neutral-900" href="/shop">Back to shop</Link>
          </div>
        </Container>
      </div>

      <main className="py-10">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Search</h1>
              <p className="mt-2 text-sm text-neutral-600">
                {query ? `Showing results for "${query}"` : "Enter a search query to see results."}
              </p>
            </div>
            <Link
              href="/shop"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              View all products
            </Link>
          </div>

          <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-600">
            {query ? (
              <span>
                Found <span className="font-semibold text-neutral-900">{rows.length}</span> results
              </span>
            ) : (
              <span>No query provided</span>
            )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 max-[420px]:grid-cols-1 min-[421px]:grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rows.map((p) => {
              const sortedImages = [...(p.images ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
              const img = sortedImages[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
              const imgAlt = sortedImages[0]?.alt || p.name;
              return (
                <ProductCard
                  key={p.id}
                  p={{
                    id: p.slug,
                    name: p.name,
                    price: formatPKR(Number(p.price ?? 0)),
                    compareAt: p.compareAt ? formatPKR(Number(p.compareAt)) : undefined,
                    badge: p.badge ?? undefined,
                    rating: p.rating ?? 0,
                    reviews: p.reviewsCount ?? 0,
                    image: img,
                    imageAlt: imgAlt,
                    shortDesc: p.shortDesc ?? undefined,
                    href: `/product/${p.slug}`,
                  }}
                  variant="compact"
                />
              );
            })}
          </div>
        </Container>
      </main>
    </div>
  );
}
