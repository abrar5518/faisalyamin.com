// src/app/blog/page.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import BlogCard, { BlogPostCard } from "@/components/BlogCard";
import { prisma } from "@/lib/prisma";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, itemListSchema } from "@/components/seo/schemas";
import { canonicalUrl, normalizeSiteUrl } from "@/lib/siteUrl";

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function excerptFromHtml(html: string, maxLen = 160) {
  const text = stripHtml(html);
  if (!text) return "New post coming soon.";
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

function readTimeMin(html: string) {
  const text = stripHtml(html);
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function buildHref(page: number, tag?: string) {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (tag) qs.set("tag", tag);
  return `/blog?${qs.toString()}`;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const tag = sp?.tag?.trim();
  const rawPage = Number(sp?.page ?? 1);
  const page = Number.isFinite(rawPage) && rawPage > 1 ? Math.floor(rawPage) : 1;
  const baseUrl = canonicalUrl();

  const title = "Blog – Water Bottles, Health Tips & Buying Guides | Sahoolat";
  const description = "Read expert blogs on water bottles, hydration tips, fitness, and buying guides in Pakistan. Stay updated with Sahoolat insights.";
  const keywords = [
    "water bottle blog",
    "hydration tips Pakistan",
    "fitness blog",
    "water bottle guide"
  ].join(", ");

  const qs = new URLSearchParams();
  if (page > 1) qs.set("page", String(page));
  if (tag) qs.set("tag", tag);
  const canonical = `${baseUrl}/blog`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: tag || page > 1 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

type PageProps = {
  searchParams?: Promise<{ page?: string; tag?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const tag = sp?.tag?.trim();

  const where = tag
    ? {
        isPublished: true,
        OR: [
          { title: { contains: tag } },
          { excerpt: { contains: tag } },
        ],
      }
    : { isPublished: true };

  const pageSize = 9;
  const total = await prisma.blog.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = clampInt(sp?.page, 1, 1, totalPages);

  const [rows, siteSettings] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        contentHtml: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const pagePosts: BlogPostCard[] = rows.map((post) => {
    const date = post.publishedAt ?? post.createdAt;
    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt ?? excerptFromHtml(post.contentHtml),
      image: post.coverImage || FALLBACK_IMAGE,
      imageAlt: post.title,
      date: date.toISOString().slice(0, 10),
      readTimeMin: readTimeMin(post.contentHtml),
    };
  });

  const featured = page === 1 ? pagePosts[0] : undefined;
  const rest = page === 1 ? pagePosts.slice(1) : pagePosts;

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const baseUrlResolved = normalizeSiteUrl(siteSettings?.siteUrl);
  const pageUrl = tag
    ? `${baseUrlResolved}/blog?tag=${encodeURIComponent(tag)}`
    : `${baseUrlResolved}/blog`;
  type BlogItemSchema = {
    name: string;
    url: string;
    image?: string;
  };

  const postItems = pagePosts.slice(0, 20).reduce<BlogItemSchema[]>((items, post) => {
    if (!post.slug) return items;

    const url = absoluteUrl(`/blog/${post.slug}`, baseUrlResolved);
    items.push({
      name: post.title,
      url,
      image: post.image ? absoluteUrl(post.image, baseUrlResolved) : undefined,
    });
    return items;
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Schema
        data={breadcrumbSchema([
          { name: "Home", item: baseUrlResolved },
          { name: "Blog", item: `${baseUrlResolved}/blog` },
          ...(tag ? [{ name: tag, item: pageUrl }] : []),
        ])}
      />
      {postItems.length > 0 ? (
        <Schema
          data={itemListSchema({
            url: pageUrl,
            items: postItems,
          })}
        />
      ) : null}
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Blog</span>
            {tag ? (
              <>
                <span className="text-neutral-300">/</span>
                <span className="text-neutral-900">#{tag}</span>
              </>
            ) : null}
          </div>
        </Container>
      </div>

      {/* Header */}
      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-6 py-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                Insights and buying guides
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                LuxStore Blog
              </h1>

              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                Premium guides, authenticity tips, trends, and product insights.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {["Buying Guide", "Authenticity", "Trends", "Care Tips"].map((x) => (
                  <Link
                    key={x}
                    href={buildHref(1, x)}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 hover:bg-white"
                  >
                    #{x}
                  </Link>
                ))}
                {tag ? (
                  <Link
                    href="/blog"
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                  >
                    Clear filter
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold">Search</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Find articles quickly by topic.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-neutral-900" />
                  <input
                    type="search"
                    placeholder="Search articles..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="bg-white py-12">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Showing{" "}
                <span className="text-neutral-600">
                  {start}-{end}
                </span>{" "}
                of{" "}
                <span className="text-neutral-600">{total}</span> posts
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Page {page} of {totalPages}
              </p>
            </div>

            <select
              className="h-10 rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
              defaultValue="latest"
              aria-label="Sort posts"
            >
              <option value="latest">Sort: Latest</option>
              <option value="popular">Sort: Popular</option>
              <option value="readtime">Sort: Short reads</option>
            </select>
          </div>

          {/* Featured card (only on page 1) */}
          {featured ? (
            <div className="mt-8">
              <BlogCard p={featured} variant="featured" />
            </div>
          ) : null}

          {/* Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <BlogCard key={p.slug} p={p} variant="default" />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row">
            <div className="text-xs text-neutral-500">
              Tip: Publish 2-3 posts/week for SEO compounding.
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={buildHref(Math.max(1, page - 1), tag)}
                aria-disabled={page === 1}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  page === 1
                    ? "pointer-events-none border-neutral-200 text-neutral-400"
                    : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                Prev
              </Link>

              {/* Page buttons (compact, professional) */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                  const n = i + 1;
                  const active = n === page;
                  return (
                    <Link
                      key={n}
                      href={buildHref(n, tag)}
                      className={[
                        "h-10 w-10 rounded-xl border text-sm flex items-center justify-center",
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      {n}
                    </Link>
                  );
                })}
                {totalPages > 7 ? (
                  <span className="px-2 text-sm text-neutral-400">...</span>
                ) : null}
              </div>

              <Link
                href={buildHref(Math.min(totalPages, page + 1), tag)}
                aria-disabled={page === totalPages}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  page === totalPages
                    ? "pointer-events-none border-neutral-200 text-neutral-400"
                    : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                Next
              </Link>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}
