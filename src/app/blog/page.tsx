import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import BlogCard, { BlogPostCard } from "@/components/BlogCard";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, itemListSchema } from "@/components/seo/schemas";
import { parseBlogTags, readTimeMin } from "@/lib/blogContent";
import { prisma } from "@/lib/prisma";
import { canonicalUrl, normalizeSiteUrl } from "@/lib/siteUrl";
import { withResponsiveTables } from "@/lib/richText";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

type PageProps = {
  searchParams?: Promise<{ page?: string; tag?: string; category?: string }>;
};

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function excerptFromHtml(html: string, maxLen = 160) {
  const text = stripHtml(html);
  if (!text) return "New post coming soon.";
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function buildHref(page: number, tag?: string, category?: string) {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (tag) qs.set("tag", tag);
  if (category) qs.set("category", category);
  return `/blog?${qs.toString()}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = searchParams ? await searchParams : undefined;
  const tag = sp?.tag?.trim();
  const category = sp?.category?.trim();
  const rawPage = Number(sp?.page ?? 1);
  const page = Number.isFinite(rawPage) && rawPage > 1 ? Math.floor(rawPage) : 1;
  const baseUrl = canonicalUrl();
  const pageRow = await prisma.page.findUnique({ where: { slug: "blog" } });

  const title = pageRow?.metaTitle || pageRow?.title || "Blog";
  const description =
    pageRow?.metaDescription ||
    pageRow?.shortDescription ||
    "Read buying guides, product tips, and customer education articles.";
  const canonical = `${baseUrl}/blog`;

  return {
    title,
    description,
    keywords: pageRow?.metaKeywords || undefined,
    alternates: { canonical },
    robots: tag || category || page > 1 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const tag = sp?.tag?.trim();
  const category = sp?.category?.trim();

  const where = {
    isPublished: true,
    ...(tag ? { tags: { contains: tag } } : {}),
    ...(category ? { category: { equals: category } } : {}),
  };

  const pageSize = 9;
  const total = await prisma.blog.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = clampInt(sp?.page, 1, 1, totalPages);

  const [rows, siteSettings, pageRow, allPublished] = await Promise.all([
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
        category: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.page.findUnique({ where: { slug: "blog" } }),
    prisma.blog.findMany({
      where: { isPublished: true },
      select: { category: true, tags: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
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
      tags: parseBlogTags(post.tags).slice(0, 3),
    };
  });

  const featured = page === 1 ? pagePosts[0] : undefined;
  const rest = page === 1 ? pagePosts.slice(1) : pagePosts;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const baseUrlResolved = normalizeSiteUrl(siteSettings?.siteUrl);
  const pageUrl = tag
    ? `${baseUrlResolved}/blog?tag=${encodeURIComponent(tag)}`
    : category
      ? `${baseUrlResolved}/blog?category=${encodeURIComponent(category)}`
      : `${baseUrlResolved}/blog`;
  const categoryOptions = Array.from(
    new Set(allPublished.map((post) => post.category).filter(Boolean) as string[])
  ).slice(0, 8);
  const tagOptions = Array.from(
    new Set(allPublished.flatMap((post) => parseBlogTags(post.tags)))
  ).slice(0, 12);
  const chipOptions = [
    ...categoryOptions.map((value) => ({ value, type: "category" as const })),
    ...tagOptions.map((value) => ({ value, type: "tag" as const })),
  ].slice(0, 10);
  const postItems = pagePosts.slice(0, 20).map((post) => ({
    name: post.title,
    url: absoluteUrl(`/blog/${post.slug}`, baseUrlResolved),
    image: post.image ? absoluteUrl(post.image, baseUrlResolved) : undefined,
  }));

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Schema
        data={breadcrumbSchema([
          { name: "Home", item: baseUrlResolved },
          { name: "Blog", item: `${baseUrlResolved}/blog` },
          ...(tag ? [{ name: tag, item: pageUrl }] : []),
          ...(category ? [{ name: category, item: pageUrl }] : []),
        ])}
      />
      {postItems.length ? <Schema data={itemListSchema({ url: pageUrl, items: postItems })} /> : null}

      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Blog</span>
            {tag || category ? (
              <>
                <span className="text-neutral-300">/</span>
                <span className="text-neutral-900">{tag ? `#${tag}` : category}</span>
              </>
            ) : null}
          </div>
        </Container>
      </div>

      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-6 py-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                {pageRow?.heroBadge || "Insights and guides"}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {pageRow?.heroTitle || pageRow?.title || "Blog"}
              </h1>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                {pageRow?.heroSubtitle ||
                  pageRow?.shortDescription ||
                  "Buying guides, product tips, and customer education articles."}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {chipOptions.map((item) => (
                  <Link
                    key={`${item.type}-${item.value}`}
                    href={
                      item.type === "category"
                        ? buildHref(1, undefined, item.value)
                        : buildHref(1, item.value)
                    }
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 hover:bg-white"
                  >
                    {item.type === "category" ? item.value : `#${item.value}`}
                  </Link>
                ))}
                {tag || category ? (
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
                <p className="text-sm font-semibold">Explore articles</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Browse by category or tag to find relevant guides faster.
                </p>
                <div className="mt-3 grid gap-2">
                  <Link href="/blog" className="theme-primary-action rounded-2xl bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800">
                    All posts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {pageRow?.contentHtml ? (
        <section className="bg-white py-10">
          <Container>
            <div
              className="rt-content rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8"
              dangerouslySetInnerHTML={{ __html: withResponsiveTables(pageRow.contentHtml) }}
            />
          </Container>
        </section>
      ) : null}

      <section className="bg-white py-12">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Showing <span className="text-neutral-600">{start}-{end}</span> of{" "}
                <span className="text-neutral-600">{total}</span> posts
              </p>
              <p className="mt-1 text-xs text-neutral-500">Page {page} of {totalPages}</p>
            </div>
          </div>

          {featured ? (
            <div className="mt-8">
              <BlogCard p={featured} variant="featured" />
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <BlogCard key={post.slug} p={post} variant="default" />
            ))}
          </div>

          {!pagePosts.length ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
              No published posts found.
            </div>
          ) : null}

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row">
            <div className="text-xs text-neutral-500">
              Keep guides clear, helpful, and linked to relevant products.
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={buildHref(Math.max(1, page - 1), tag, category)}
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
              <Link
                href={buildHref(Math.min(totalPages, page + 1), tag, category)}
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
