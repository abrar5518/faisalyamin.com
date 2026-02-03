// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import BlogCard, { BlogPostCard } from "@/components/BlogCard";
import ProductCard, { Product as ProductCardItem } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, blogPostingSchema, breadcrumbSchema } from "@/components/seo/schemas";
import SubscribeCard from "@/components/SubscribeCard";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: { name: string; role: string; avatar: string; slug: string };
  tags: string[];
  html: string;
  related: BlogPostCard[];
};

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

function excerptFromHtml(html: string, maxLen = 180) {
  const text = stripHtml(html);
  if (!text) return "New post coming soon.";
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

function estimateReadingTime(html: string) {
  const text = stripHtml(html);
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return { words, minutes };
}

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function mapBlogProduct(row: any): ProductCardItem {
  const product = row?.product ?? row;
  const img = product?.images?.[0]?.url || FALLBACK_IMAGE;
  return {
    id: product?.slug ?? String(product?.id ?? ""),
    name: product?.name ?? "Untitled product",
    price: formatPKR(Number(product?.price ?? 0)),
    compareAt: product?.compareAt != null ? formatPKR(Number(product.compareAt)) : undefined,
    badge: product?.badge ?? undefined,
    rating: typeof product?.rating === "number" ? product.rating : 0,
    reviews: typeof product?.reviewsCount === "number" ? product.reviewsCount : 0,
    image: img,
    imageAlt: product?.images?.[0]?.alt ?? product?.name ?? "Product image",
    href: product?.slug ? `/product/${product.slug}` : undefined,
  };
}

function extractHeadings(html: string) {
  const matches = [...html.matchAll(/<h([2-3])>(.*?)<\/h\1>/gi)];
  return matches.map((m, idx) => {
    const level = Number(m[1]);
    const raw = m[2].replace(/<[^>]*>/g, "");
    const id =
      raw
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") + `-${idx}`;
    return { id, level, text: raw };
  });
}

function injectHeadingIds(html: string, headings: { id: string; level: number; text: string }[]) {
  let out = html;
  headings.forEach((h) => {
    const re = new RegExp(
      `<h${h.level}>\\s*${h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<\\/h${h.level}>`,
      "i"
    );
    out = out.replace(re, `<h${h.level} id="${h.id}">${h.text}</h${h.level}>`);
  });
  return out;
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
      {children}
    </span>
  );
}

function ProductInsert({ title, items }: { title: string; items: ProductCardItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Featured products</p>
          <h3 className="mt-1 text-lg font-semibold text-neutral-900">{title}</h3>
        </div>
        <Link href="/shop" className="text-xs font-medium text-neutral-600 hover:text-neutral-900">
          Shop all
        </Link>
      </div>
      <div className="mt-4 grid gap-3 max-[420px]:grid-cols-1 min-[421px]:grid-cols-2 sm:gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} variant="compact" />
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const post = await prisma.blog.findFirst({
    where: { slug, isPublished: true },
    select: {
      title: true,
      excerpt: true,
      contentHtml: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
    },
  });

  if (!post) {
    return {
      title: "Post not found",
      description: "This blog post could not be found.",
      alternates: { canonical: `${baseUrl}/blog/${slug}` },
    };
  }

  return {
    title: post.metaTitle || undefined,
    description: post.metaDescription || undefined,
    keywords: post.metaKeywords || undefined,
    alternates: { canonical: `${baseUrl}/blog/${slug}` },
  };
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const [postRow, siteSettings, contact, authorRow] = await Promise.all([
    prisma.blog.findFirst({
      where: { slug, isPublished: true },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        contentHtml: true,
        publishedAt: true,
        createdAt: true,
        blogProducts: {
          where: { product: { isActive: true } },
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                price: true,
                compareAt: true,
                badge: true,
                rating: true,
                reviewsCount: true,
                images: {
                  orderBy: { sortOrder: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.contact.findFirst({ orderBy: { id: "asc" } }),
    prisma.blogAuthor.findFirst({ orderBy: { id: "asc" } }),
  ]);

  if (!postRow) {
    notFound();
  }

  const date = postRow.publishedAt ?? postRow.createdAt;

  const relatedRows = await prisma.blog.findMany({
    where: { isPublished: true, slug: { not: slug } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      createdAt: true,
      contentHtml: true,
    },
  });

  const related: BlogPostCard[] = relatedRows.map((r) => {
    const rDate = r.publishedAt ?? r.createdAt;
    return {
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? excerptFromHtml(r.contentHtml),
      image: r.coverImage || FALLBACK_IMAGE,
      date: rDate.toISOString().slice(0, 10),
      readTimeMin: estimateReadingTime(r.contentHtml).minutes,
    };
  });

  const author = authorRow
    ? {
        name: authorRow.name,
        role: authorRow.role || "Editorial",
        avatar:
          authorRow.avatar ||
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        slug: authorRow.slug,
      }
    : {
        name: "LuxStore Editorial",
        role: "Premium eCommerce Team",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        slug: "luxstore-editorial",
      };

  const post: BlogPost = {
    slug: postRow.slug,
    title: postRow.title,
    excerpt: postRow.excerpt ?? excerptFromHtml(postRow.contentHtml),
    coverImage: postRow.coverImage || FALLBACK_IMAGE,
    date: date.toISOString().slice(0, 10),
    author,
    tags: [],
    html: postRow.contentHtml,
    related,
  };

  const productGroups: Record<"top" | "middle" | "bottom", ProductCardItem[]> = {
    top: [],
    middle: [],
    bottom: [],
  };

  postRow.blogProducts?.forEach((row) => {
    const placement = String(row.placement || "MIDDLE").toLowerCase();
    const item = mapBlogProduct(row);
    if (placement === "top") productGroups.top.push(item);
    else if (placement === "bottom") productGroups.bottom.push(item);
    else productGroups.middle.push(item);
  });

  const rt = estimateReadingTime(post.html);
  const headings = extractHeadings(post.html);
  const htmlWithIds = injectHeadingIds(post.html, headings);
  const baseUrlResolved = (siteSettings?.siteUrl || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const pageUrl = `${baseUrlResolved}/blog/${post.slug}`;
  const publisherName = siteSettings?.siteName?.trim() || "LuxStore";
  const publisherLogo = siteSettings?.logoUrl || siteSettings?.siteIconUrl || "/favicon.ico";
  const descriptionText = post.excerpt || excerptFromHtml(post.html);
  const contactWhatsapp = contact?.whatsapp || "";
  const whatsappDigits = contactWhatsapp.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "/contact";

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Schema
        data={breadcrumbSchema([
          { name: "Home", item: baseUrlResolved },
          { name: "Blog", item: `${baseUrlResolved}/blog` },
          { name: post.title, item: pageUrl },
        ])}
      />
      <Schema
        data={blogPostingSchema({
          headline: post.title,
          description: descriptionText,
          url: pageUrl,
          image: absoluteUrl(post.coverImage, baseUrlResolved),
          datePublished: post.date,
          authorName: post.author.name,
          publisherName,
          publisherLogo: absoluteUrl(publisherLogo, baseUrlResolved),
        })}
      />
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <Link className="hover:text-neutral-900" href="/blog">Blog</Link>
            <span className="text-neutral-300">/</span>
            <span className="line-clamp-1 text-neutral-900">{post.title}</span>
          </div>
        </Container>
      </div>

      {/* Hero */}
      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-8 py-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap gap-2">
                <Pill>Guide</Pill>
                <Pill>{formatDate(post.date)}</Pill>
                <Pill>{rt.minutes} min read</Pill>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {post.title}
              </h1>

              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                {post.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Image
                  src={withImageParams(post.author.avatar, "auto=format&fit=crop&w=140&q=80")}
                  alt={post.author.name}
                  width={140}
                  height={140}
                  className="h-11 w-11 rounded-2xl object-cover"
                  loading="lazy"
                />
                <div>
                  <Link
                    href={`/blog/author/${post.author.slug}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {post.author.name}
                  </Link>
                  <p className="text-xs text-neutral-500">{post.author.role}</p>
                </div>
              </div>

              {post.tags.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/blog?tag=${encodeURIComponent(t)}`}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 hover:bg-white"
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* Share row (UI) */}
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <button className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-xs hover:bg-neutral-50">
                  Copy link
                </button>
                <button className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-xs hover:bg-neutral-50">
                  Share on X
                </button>
                <button className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-xs hover:bg-neutral-50">
                  Share on LinkedIn
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                <Image
                  src={withImageParams(post.coverImage, "auto=format&fit=crop&w=1600&q=85")}
                  alt={post.title}
                  width={1600}
                  height={1000}
                  className="h-[240px] w-full object-cover sm:h-[300px]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Content */}
      <main className="py-12">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Article */}
            <article className="lg:col-span-8">
              <ProductInsert title="Top picks from this story" items={productGroups.top} />

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <div
                  className="rt-content"
                  dangerouslySetInnerHTML={{ __html: htmlWithIds }}
                />
              </div>

              <ProductInsert title="Products worth a closer look" items={productGroups.middle} />

              {/* CTA strip */}
              <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
                <p className="text-sm font-semibold">Want help choosing the right watch?</p>
                <p className="mt-2 text-sm text-neutral-600">
                  Tell us your budget and preferred brand. We&apos;ll recommend the best options for you.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={whatsappHref}
                    className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    WhatsApp Support
                  </Link>
                  <Link
                    href="/shop"
                    className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
                  >
                    Browse Store
                  </Link>
                </div>
              </div>

              <ProductInsert title="More from the store" items={productGroups.bottom} />
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-6 space-y-6">
                {/* TOC */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <p className="text-sm font-semibold">On this page</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Jump to sections quickly.
                  </p>

                  <div className="mt-4 space-y-2">
                    {headings.length ? (
                      headings.map((h) => (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          className={[
                            "block rounded-xl px-3 py-2 text-sm hover:bg-neutral-50",
                            h.level === 3 ? "ml-4 text-neutral-600" : "text-neutral-900",
                          ].join(" ")}
                        >
                          {h.text}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-600">No sections found.</p>
                    )}
                  </div>
                </div>

                {/* Quick links */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <p className="text-sm font-semibold">Explore more</p>
                <div className="mt-4 grid gap-2">
                  <Link
                      href="/shop"
                      className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      Browse Store
                    </Link>
                    <Link
                      href="/blog"
                      className="rounded-2xl border border-neutral-200 px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
                    >
                      View All Articles
                    </Link>
                  </div>
                </div>

                {/* Newsletter */}
                <SubscribeCard source="blog_sidebar" />
              </div>
            </aside>
          </div>

          {/* Related posts */}
          <section className="mt-14">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Related posts</h2>
                <p className="mt-2 text-sm text-neutral-600">More reads you might like.</p>
              </div>
              <Link href="/blog" className="text-sm font-medium hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {post.related.map((r) => (
                <BlogCard key={r.slug} p={r} variant="default" />
              ))}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
