import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Customer reviews and buying experiences.",
  alternates: { canonical: `${baseUrl}/reviews` },
};

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rounded;
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={filled ? "h-4 w-4 text-neutral-900" : "h-4 w-4 text-neutral-300"}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 2.25l2.47 5.01 5.53.8-4 3.9.94 5.52L10 14.8l-4.94 2.68.94-5.52-4-3.9 5.53-.8L10 2.25z" />
          </svg>
        );
      })}
    </div>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default async function ReviewsPage() {
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: "Reviews", item: `${baseUrlResolved}/reviews` },
      ]
    : [];

  const reviews = await prisma.productReview.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {breadcrumbItems.length ? <Schema data={breadcrumbSchema(breadcrumbItems)} /> : null}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Reviews</span>
          </div>
        </Container>
      </div>

      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Customer reviews</h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            Real feedback from verified buyers across the globe.
          </p>

          {reviews.length ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {reviews.map((review) => {
                return (
                  <article
                    key={review.id}
                    className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-neutral-900 via-neutral-500 to-transparent" />

                    <div className="flex items-start justify-between gap-4 pt-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Stars rating={review.rating} />
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                            {review.rating}/5
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs font-medium text-neutral-700">
                            <svg
                              viewBox="0 0 20 20"
                              className="h-3.5 w-3.5 text-neutral-900"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M10 1.75l2.2 1.2 2.5-.1 1.2 2.2 2.1 1.3-.6 2.4.6 2.4-2.1 1.3-1.2 2.2-2.5-.1-2.2 1.2-2.2-1.2-2.5.1-1.2-2.2-2.1-1.3.6-2.4-.6-2.4 2.1-1.3 1.2-2.2 2.5.1L10 1.75zm-1 9.2l-1.2-1.2-1 1 2.2 2.2 4.3-4.3-1-1L9 10.95z" />
                            </svg>
                            Verified buyer
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-semibold text-white">
                            {(review.user?.name || "C").slice(0, 1).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {review.user?.name || "Customer"}
                            </p>
                            {review.product?.name ? (
                              <p className="truncate text-xs text-neutral-500">
                                Reviewed: {review.product.name}
                              </p>
                            ) : (
                              <p className="text-xs text-neutral-500">Customer review</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {review.createdAt ? (
                        <div className="shrink-0">
                          <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {review.title ? (
                      <p className="mt-5 text-sm font-semibold text-neutral-900">
                        {review.title}
                      </p>
                    ) : null}

                    <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
                      <div className="flex gap-3">
                        <svg
                          viewBox="0 0 24 24"
                          className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M7.2 17.6c-2.1 0-3.8-1.7-3.8-3.8 0-4.2 2.1-7.1 6.3-8.7l1 2c-2.8 1.2-4.2 3-4.2 5.4 0 .2 0 .4.1.6.2-.1.4-.1.6-.1 1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1zm10.2 0c-2.1 0-3.8-1.7-3.8-3.8 0-4.2 2.1-7.1 6.3-8.7l1 2c-2.8 1.2-4.2 3-4.2 5.4 0 .2 0 .4.1.6.2-.1.4-.1.6-.1 1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1z" />
                        </svg>

                        <p className="text-sm leading-relaxed text-neutral-700">
                          {review.body}
                        </p>
                      </div>
                    </div>

                    {review.images.length ? (
                      <div className="mt-5">
                        <div className="grid grid-cols-3 gap-3">
                          {review.images.slice(0, 6).map((img, idx) => (
                            <div
                              key={`${img.url}-${idx}`}
                              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                            >
                              <img
                                src={img.url}
                                alt={img.alt || review.product?.name || "Review image"}
                                className="h-24 w-full object-cover transition duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                        {review.images.length > 6 ? (
                          <p className="mt-2 text-xs text-neutral-500">
                            +{review.images.length - 6} more photo(s)
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      {review.product?.slug ? (
                        <Link
                          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50"
                          href={`/product/${review.product.slug}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                          View product
                        </Link>
                      ) : (
                        <span className="text-xs text-neutral-400">Product link not available</span>
                      )}

                      <span className="text-xs text-neutral-400">Thank you for sharing</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
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
