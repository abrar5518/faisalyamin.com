import { normalizeCanonicalUrl } from "@/lib/siteUrl";

export function normalizeUrl(value: string) {
  if (!value) return value;
  return normalizeCanonicalUrl(value);
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
  aggregateRating,
  reviews,
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
  aggregateRating?: { ratingValue: number; reviewCount: number };
  reviews?: Array<{
    name: string;
    author: string;
    ratingValue: number;
    reviewBody: string;
  }>;
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
  ...(aggregateRating
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.ratingValue,
          reviewCount: aggregateRating.reviewCount,
        },
      }
    : {}),
  ...(reviews?.length
    ? {
        review: reviews.map((r) => ({
          "@type": "Review",
          name: r.name,
          reviewBody: r.reviewBody,
          author: { "@type": "Person", name: r.author },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.ratingValue,
            bestRating: 5,
          },
        })),
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
  id,
  sku,
  mpn,
  gtin13,
  brand,
  images,
  url,
  color,
  size,
  material,
  additionalProperties,
  price,
  currency = "PKR",
  availability = "https://schema.org/InStock",
  condition = "https://schema.org/NewCondition",
  category,
  sellerName,
  sellerUrl,
  sellerId,
  shipping,
  returnPolicy,
  aggregateRating,
  reviews,
}: {
  name: string;
  description: string;
  id?: string;
  sku?: string;
  mpn?: string;
  gtin13?: string;
  brand: string;
  images: string[];
  url: string;
  color?: string;
  size?: string;
  material?: string;
  additionalProperties?: Array<{ name: string; value: string }>;
  price: number;
  currency?: string;
  availability?: string;
  condition?: string;
  category?: string;
  sellerName?: string;
  sellerUrl?: string;
  sellerId?: string;
  shipping?: {
    country: string;
    price: number;
    currency?: string;
    handlingMinDays?: number;
    handlingMaxDays?: number;
    transitMinDays?: number;
    transitMaxDays?: number;
  };
  returnPolicy?: {
    country: string;
    days: number;
    fees?: "https://schema.org/FreeReturn" | "https://schema.org/ReturnShippingFees";
    method?: "https://schema.org/ReturnByMail" | "https://schema.org/ReturnInStore" | "https://schema.org/ReturnAtKiosk";
  };
  aggregateRating?: { ratingValue: number; reviewCount: number };
  reviews?: Array<{
    author: string;
    ratingValue: number;
    reviewBody: string;
    name?: string;
    datePublished?: string;
  }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": id || `${url}#product`,
  url,
  name,
  description,
  image: images,
  ...(sku ? { sku } : {}),
  ...(mpn ? { mpn } : {}),
  ...(gtin13 ? { gtin13 } : {}),
  brand: { "@type": "Brand", name: brand },
  ...(category ? { category } : {}),
  ...(color ? { color } : {}),
  ...(size ? { size } : {}),
  ...(material ? { material } : {}),
  ...(additionalProperties?.length
    ? {
        additionalProperty: additionalProperties.map((property) => ({
          "@type": "PropertyValue",
          name: property.name,
          value: property.value,
        })),
      }
    : {}),
  offers: {
    "@type": "Offer",
    "@id": `${url}#offer`,
    url,
    priceCurrency: currency,
    price: String(price),
    availability,
    itemCondition: condition,
    ...(sellerName
      ? {
          seller: {
            "@type": "Organization",
            ...(sellerId ? { "@id": sellerId } : {}),
            name: sellerName,
            ...(sellerUrl ? { url: sellerUrl } : {}),
          },
        }
      : {}),
    ...(shipping
      ? {
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: shipping.country,
            },
            shippingRate: {
              "@type": "MonetaryAmount",
              value: shipping.price,
              currency: shipping.currency || currency,
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: shipping.handlingMinDays ?? 0,
                maxValue: shipping.handlingMaxDays ?? 1,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: shipping.transitMinDays ?? 2,
                maxValue: shipping.transitMaxDays ?? 5,
                unitCode: "DAY",
              },
            },
          },
        }
      : {}),
    ...(returnPolicy
      ? {
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: returnPolicy.country,
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: returnPolicy.days,
            returnMethod: returnPolicy.method || "https://schema.org/ReturnByMail",
            returnFees: returnPolicy.fees || "https://schema.org/ReturnShippingFees",
          },
        }
      : {}),
  },
  ...(aggregateRating
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.ratingValue,
          reviewCount: aggregateRating.reviewCount,
        },
      }
    : {}),
  ...(reviews?.length
    ? {
        review: reviews.map((r) => ({
          "@type": "Review",
          ...(r.name ? { name: r.name } : {}),
          author: { "@type": "Person", name: r.author },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.ratingValue,
            bestRating: 5,
            worstRating: 1,
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
