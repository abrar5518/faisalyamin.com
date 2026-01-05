// src/lib/admin-api.ts
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
};

export type AdminLoginResponse = {
  access_token: string;
  refresh_token?: string;
  user: AdminUser;
};

export type AdminMetric = { label: string; value: string; hint?: string };

export type AdminProductRow = {
  id: string;
  name: string;
  status: "draft" | "published";
  price: string;
  stock: number;
  category: string;
  updatedAt: string;
  image?: string;
};

/** ✅ Frontend-aligned Category schema */
export type AdminCategory = {
  id: string;
  slug: string;          // used in /categories/[slug]
  title: string;         // shown in page heading
  subtitle: string;      // shown under heading
  heroImage?: string;    // top image
  richHtml: string;      // long SEO content (CMS)
  // optional SEO toggles (recommended)
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  updatedAt?: string;
};

/** ✅ Frontend-aligned Subcategory schema */
export type AdminSubcategory = {
  id: string;
  categorySlug: string;   // parent category
  subSlug: string;        // used in /categories/[slug]/[sub]
  title: string;          // page title
  intro: string;          // short intro under title
  heroImage?: string;
  richHtml: string;       // SEO content
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  updatedAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const AdminAPI = {
  login: (email: string, password: string) =>
    api<AdminLoginResponse>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  dashboard: () => api<{ metrics: AdminMetric[]; recentOrders: any[] }>("/api/admin/dashboard"),

  products: (page = 1, q = "") =>
    api<{ items: AdminProductRow[]; page: number; totalPages: number; total: number }>(
      `/api/admin/products?page=${page}&q=${encodeURIComponent(q)}`
    ),

  // ✅ Categories
  categories: (page = 1, q = "") =>
    api<{ items: AdminCategory[]; page: number; totalPages: number; total: number }>(
      `/api/admin/categories?page=${page}&q=${encodeURIComponent(q)}`
    ),

  categoryById: (id: string) => api<AdminCategory>(`/api/admin/categories/${id}`),

  createCategory: (payload: Omit<AdminCategory, "id" | "updatedAt">) =>
    api<{ id: string }>(`/api/admin/categories`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCategory: (id: string, payload: Partial<Omit<AdminCategory, "id" | "updatedAt">>) =>
    api<{ ok: true }>(`/api/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // ✅ Subcategories
  subcategories: (page = 1, q = "", categorySlug = "") =>
    api<{ items: AdminSubcategory[]; page: number; totalPages: number; total: number }>(
      `/api/admin/subcategories?page=${page}&q=${encodeURIComponent(q)}&categorySlug=${encodeURIComponent(
        categorySlug
      )}`
    ),

  subcategoryById: (id: string) => api<AdminSubcategory>(`/api/admin/subcategories/${id}`),

  createSubcategory: (payload: Omit<AdminSubcategory, "id" | "updatedAt">) =>
    api<{ id: string }>(`/api/admin/subcategories`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateSubcategory: (id: string, payload: Partial<Omit<AdminSubcategory, "id" | "updatedAt">>) =>
    api<{ ok: true }>(`/api/admin/subcategories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
