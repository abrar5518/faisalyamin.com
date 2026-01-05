"use client";

import AdminTopbar from "@/components/admin/AdminTopbar";

const ADMIN_APIS = [
  {
    group: "Categories",
    items: [
      "GET /api/admin/categories",
      "GET /api/admin/categories?slug={slug}",
      "POST /api/admin/categories",
      "PUT /api/admin/categories?slug={slug}",
      "DELETE /api/admin/categories?slug={slug}",
    ],
  },
  {
    group: "Subcategories",
    items: [
      "GET /api/admin/subcategories",
      "GET /api/admin/subcategories?slug={slug}",
      "POST /api/admin/subcategories",
      "PUT /api/admin/subcategories?slug={slug}",
      "DELETE /api/admin/subcategories?slug={slug}",
    ],
  },
  {
    group: "Products",
    items: [
      "GET /api/admin/products",
      "GET /api/admin/products?slug={slug}",
      "POST /api/admin/products",
      "PUT /api/admin/products?slug={slug}",
      "DELETE /api/admin/products?slug={slug}",
    ],
  },
  {
    group: "Blogs",
    items: [
      "GET /api/admin/blogs",
      "GET /api/admin/blogs?slug={slug}",
      "POST /api/admin/blogs",
      "PUT /api/admin/blogs?slug={slug}",
      "DELETE /api/admin/blogs?slug={slug}",
    ],
  },
  {
    group: "Pages",
    items: [
      "GET /api/admin/pages",
      "GET /api/admin/pages?slug={slug}",
      "POST /api/admin/pages",
      "PUT /api/admin/pages?slug={slug}",
      "DELETE /api/admin/pages?slug={slug}",
    ],
  },
  {
    group: "Uploads",
    items: ["POST /api/admin/uploads"],
  },
  {
    group: "Security",
    items: ["POST /api/admin/auth/login", "POST /api/admin/auth/logout", "PUT /api/admin/security"],
  },
  {
    group: "Contact",
    items: ["GET /api/admin/contact", "PUT /api/admin/contact"],
  },
  {
    group: "Site Settings",
    items: ["GET /api/admin/site-settings", "PUT /api/admin/site-settings"],
  },
  {
    group: "Store Settings",
    items: ["GET /api/admin/store-settings", "PUT /api/admin/store-settings"],
  },
];

const PUBLIC_APIS = [
  {
    group: "Categories",
    items: ["GET /api/categories", "GET /api/categories?slug={slug}"],
  },
  {
    group: "Subcategories",
    items: [
      "GET /api/subcategories",
      "GET /api/subcategories?slug={slug}",
      "GET /api/subcategories?categorySlug={slug}",
    ],
  },
  {
    group: "Products",
    items: [
      "GET /api/products",
      "GET /api/products?slug={slug}",
      "GET /api/products?q={query}&page={n}&pageSize={n}&sort={field}",
      "GET /api/products?categorySlug={slug}",
      "GET /api/products?subcategorySlug={slug}",
      "GET /api/products?isSale=1",
      "GET /api/products?isFeatured=1",
      "GET /api/products?isActive=1",
    ],
  },
  {
    group: "Contact",
    items: ["GET /api/contact"],
  },
  {
    group: "Site Settings",
    items: ["GET /api/site-settings"],
  },
  {
    group: "Store Settings",
    items: ["GET /api/store-settings"],
  },
];

function Section({ title, groups }: { title: string; groups: { group: string; items: string[] }[] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.group} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-700">{g.group}</p>
            <ul className="mt-2 space-y-1 text-xs text-neutral-700">
              {g.items.map((i) => (
                <li key={i} className="font-mono">{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        Note: If new APIs are added in future, update this page with the new routes.
      </p>
    </div>
  );
}

export default function AdminApisPage() {
  return (
    <div className="bg-white">
      <AdminTopbar title="API Reference" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10 space-y-6">
        <Section title="Admin APIs" groups={ADMIN_APIS} />
        <Section title="Public APIs" groups={PUBLIC_APIS} />
      </div>
    </div>
  );
}
