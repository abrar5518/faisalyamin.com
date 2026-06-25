import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { withImageParams } from "@/lib/image";
import { prisma } from "@/lib/prisma";
import BlogCard, { BlogPostCard } from "@/components/BlogCard";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e";
const FALLBACK_COVER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function excerptFromHtml(html: string, maxLen = 180) {
  const text = stripHtml(html);
  if (!text) return "New post coming soon.";
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = normalizeSiteUrl();
  const author = await prisma.blogAuthor.findUnique({ where: { slug } });
  if (!author) {
    return {
      title: "Author not found",
      description: "This author profile could not be found.",
      alternates: { canonical: `${baseUrl}/blog/author/${slug}` },
    };
  }

  return {
    title: author.metaTitle || author.name,
    description: author.metaDescription || author.role || undefined,
    keywords: author.metaKeywords || undefined,
    alternates: { canonical: `${baseUrl}/blog/author/${slug}` },
  };
}

export default async function BlogAuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await prisma.blogAuthor.findUnique({ where: { slug } });
  if (!author) {
    notFound();
  }

  const posts = await prisma.blog.findMany({
    where: { isPublished: true, authorId: author.id },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
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

  const cards: BlogPostCard[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? excerptFromHtml(p.contentHtml),
    image: p.coverImage || FALLBACK_COVER,
    date: (p.publishedAt ?? p.createdAt).toISOString().slice(0, 10),
  }));

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">
              Home
            </Link>
            <span className="text-neutral-300">/</span>
            <Link className="hover:text-neutral-900" href="/blog">
              Blog
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">{author.name}</span>
          </div>
        </Container>
      </div>

      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-8 py-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-4">
                <Image
                  src={withImageParams(author.avatar || FALLBACK_AVATAR, "auto=format&fit=crop&w=160&q=80")}
                  alt={author.name}
                  width={160}
                  height={160}
                  className="h-16 w-16 rounded-2xl object-cover"
                  loading="lazy"
                />
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {author.name}
                  </h1>
                  {author.role ? (
                    <p className="mt-2 text-sm text-neutral-600">{author.role}</p>
                  ) : null}
                </div>
              </div>

              {author.bioHtml ? (
                <div
                  className="rt-content mt-6 text-sm text-neutral-600"
                  dangerouslySetInnerHTML={{ __html: author.bioHtml }}
                />
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Posts by {author.name}</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Latest published articles from this author.
              </p>
            </div>
            <Link href="/blog" className="text-sm font-medium hover:underline">
              View all posts
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((p) => (
              <BlogCard key={p.slug} p={p} variant="default" />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
