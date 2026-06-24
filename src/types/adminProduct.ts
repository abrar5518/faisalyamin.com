export type AdminImage = {
  id?: string;
  url: string;
  alt?: string;
  mediaType?: "image" | "video";
  thumbnailUrl?: string;
};

export type AdminFaqItem = {
  question: string;
  answer: string;
};

export type AdminVariant = {
  id?: string;
  label: string;       // "Silver Dial"
  colorCode: string;   // "#111827"
  images: AdminImage[]; // uploaded images
  isActive: boolean;
};

export type AdminProduct = {
  id?: string;

  brand: string;
  name: string;
  slug: string;

  badge?: string;

  price: string;
  compareAt?: string;
  currency: "PKR" | "AED";

  shortDescription: string;
  seoDescriptionHtml: string;

  // SEO metadata
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  faqItems?: AdminFaqItem[];

  // dropdowns
  categoryId: string;
  subcategoryId?: string;
  categoryIds?: string[];
  subcategoryIds?: string[];

  // sizes via chips
  sizes: string[];

  // images
  heroImage?: AdminImage; // main display
  gallery: AdminImage[];  // general product gallery (optional)
  variants: AdminVariant[];

  status: "active" | "draft" | "archived";
  stock: number;
  isFeatured: boolean;

  // reviews (managed via backend, but show summary)
  ratingAvg?: number;
  reviewsCount?: number;
};
