export function normalizeUrl(value: string) {
  if (!value) return value;
  let trimmed = value.trim();
  
  // Ensure it starts with http:// or https://
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed.replace(/^\/+/, "")}`;
  }
  
  // Remove trailing slashes
  trimmed = trimmed.replace(/\/+$/, "");
  
  // Remove duplicate slashes but preserve the protocol //
  // "([^:\/])\/+" means match any char that is not a colon, followed by a slash, and then one or more slashes
  return trimmed.replace(/([^:]\/)\/+/g, "$1");
}

export function absoluteUrl(input: string, baseUrl: string) {
  const normalizedBase = normalizeUrl(baseUrl);
  if (!input) return normalizedBase;
  
  const trimmedInput = input.trim();
  if (trimmedInput.startsWith("http://") || trimmedInput.startsWith("https://")) {
    return normalizeUrl(trimmedInput);
  }
  
  const cleanInput = trimmedInput.startsWith("/") ? trimmedInput : `/${trimmedInput}`;
  return `${normalizedBase}${cleanInput}`.replace(/([^:]\/)\/+/g, "$1");
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export const organizationSchema = ({
  name,
  url,
  logo,
  sameAs = [],
  phone,
  email,
  address,
}: {
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  phone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
}) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name,
  url,
  logo,
  sameAs,
  ...(phone || email
    ? {
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: phone,
            email,
            contactType: "customer support",
            availableLanguage: ["en", "ur"],
          },
        ],
      }
    : {}),
  ...(address
    ? {
        address: {
          "@type": "PostalAddress",
          ...address,
        },
      }
    : {}),
});

export const websiteSchema = ({
  url,
  siteName,
  searchUrlTemplate,
}: {
  url: string;
  siteName: string;
  searchUrlTemplate: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url,
  potentialAction: {
    "@type": "SearchAction",
    target: searchUrlTemplate,
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbSchema = (items: Array<{ name: string; item: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((x, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: x.name,
    item: x.item,
  })),
});

export const itemListSchema = ({
  url,
  items,
}: {
  url: string;
  items: Array<{ name: string; url: string; image?: string }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  url,
  itemListElement: items.map((it, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@id": it.url,
      name: it.name,
      ...(it.image ? { image: it.image } : {}),
    },
  })),
});

export const collectionPageSchema = ({
  name,
  description,
  url,
}: {
  name: string;
  description?: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  ...(description ? { description } : {}),
  url,
});

export const productSchema = ({
  name,
  description,
  sku,
  brand,
  images,
  url,
  price,
  currency = "PKR",
  availability = "https://schema.org/InStock",
  condition = "https://schema.org/NewCondition",
  category,
  aggregateRating,
  reviews,
}: {
  name: string;
  description: string;
  sku?: string;
  brand: string;
  images: string[];
  url: string;
  price: number;
  currency?: string;
  availability?: string;
  condition?: string;
  category?: string;
  aggregateRating?: { ratingValue: number; reviewCount: number };
  reviews?: Array<{
    author: string;
    ratingValue: number;
    reviewBody: string;
    datePublished?: string;
  }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name,
  description,
  image: images,
  ...(sku ? { sku } : {}),
  brand: { "@type": "Brand", name: brand },
  ...(category ? { category } : {}),
  offers: {
    "@type": "Offer",
    url,
    priceCurrency: currency,
    price: String(price),
    availability,
    itemCondition: condition,
  },
  ...(aggregateRating
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: String(aggregateRating.ratingValue),
          reviewCount: String(aggregateRating.reviewCount),
        },
      }
    : {}),
  ...(reviews?.length
    ? {
        review: reviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(r.ratingValue),
          },
          reviewBody: r.reviewBody,
          ...(r.datePublished ? { datePublished: r.datePublished } : {}),
        })),
      }
    : {}),
});

export const blogPostingSchema = ({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
  publisherName,
  publisherLogo,
}: {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  publisherName: string;
  publisherLogo: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline,
  description,
  url,
  image: [image],
  datePublished,
  ...(dateModified ? { dateModified } : {}),
  author: { "@type": "Person", name: authorName },
  publisher: {
    "@type": "Organization",
    name: publisherName,
    logo: { "@type": "ImageObject", url: publisherLogo },
  },
});

export const faqSchema = (faqs: Array<{ q: string; a: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((x) => ({
    "@type": "Question",
    name: x.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: x.a,
    },
  })),
});

export const contactPageSchema = ({
  url,
  name,
  description,
}: {
  url: string;
  name: string;
  description?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name,
  url,
  ...(description ? { description } : {}),
});
