import type { Metadata } from "next";
import Link from "next/link";
import ManagedPageBody from "@/components/ManagedPageBody";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";
import {
  buildManagedPageMetadata,
  getManagedPage,
  hasManagedPageBody,
} from "@/lib/managedPage";
import { prisma } from "@/lib/prisma";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata("reviews", {
    title: "Customer Reviews",
    description: "Read customer feedback and verified product reviews.",
    keywords: "customer reviews, product reviews, testimonials",
  });
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={i < rounded ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-neutral-300"}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 2.25l2.47 5.01 5.53.8-4 3.9.94 5.52L10 14.8l-4.94 2.68.94-5.52-4-3.9 5.53-.8L10 2.25z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const [page, reviews] = await Promise.all([
    getManagedPage("reviews"),
    prisma.productReview.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);
  const hasManagedContent = hasManagedPageBody(page);
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: page?.title || "Reviews", item: `${baseUrlResolved}/reviews` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {breadcrumbItems.length ? <Schema data={breadcrumbSchema(breadcrumbItems)} /> : null}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">
              Home
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">{page?.title || "Reviews"}</span>
          </div>
        </Container>
      </div>

      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {page?.heroTitle || page?.title || "Customer Reviews"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            {page?.heroSubtitle ||
              page?.shortDescription ||
              "Real feedback from verified buyers and customers."}
          </p>
        </Container>
      </section>

      {hasManagedContent ? <ManagedPageBody page={page} /> : null}

      <section className="bg-white pb-12">
        <Container>
          {reviews.length ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Stars rating={review.rating} />
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                      Verified buyer
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-semibold text-white">
                      {(review.user?.name || "C").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {review.user?.name || "Customer"}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {review.product?.name || "Customer review"}
                      </p>
                    </div>
                  </div>

                  {review.title ? (
                    <p className="mt-5 text-sm font-semibold text-neutral-900">{review.title}</p>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">{review.body}</p>

                  {review.images.length ? (
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {review.images.slice(0, 6).map((img, idx) => (
                        <div
                          key={`${img.url}-${idx}`}
                          className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
                        >
                          <img
                            src={img.url}
                            alt={img.alt || review.product?.name || "Review image"}
                            className="h-24 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-6 flex items-center justify-between gap-3">
                    {review.product?.slug ? (
                      <Link
                        className="inline-flex rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold hover:bg-neutral-50"
                        href={`/product/${review.product.slug}`}
                      >
                        View product
                      </Link>
                    ) : (
                      <span className="text-xs text-neutral-400">Product link not available</span>
                    )}
                    <span className="text-xs text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
              No approved reviews yet.
            </div>
          )}

          <div className="mt-10 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-sm font-semibold">Share your experience</p>
            <p className="mt-2 text-sm text-neutral-600">
              Want to leave a review? Contact our support team and we will guide you through the process.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Contact support
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
