# Developer Handoff Notes

These notes explain how to reuse this ecommerce project for another client or niche.

## Platform Direction

The project is being converted from a single-store website into a reusable ecommerce platform. The goal is that branding, navigation, content, checkout copy, tracking, contact details, pages, blog, reusable blocks, and theme can be managed from admin without code changes.

## Important Admin Areas

- `/admin/onboarding`: launch checklist and starter template.
- `/admin/settings`: branding, design, site, header/footer, copy, shopping, checkout, tracking, custom code, security.
- `/admin/contact`: support and store contact details.
- `/admin/pages`: organized Pages hub for Home, Shop, Deals, Categories, Blog listing, static pages, policies, and custom freestyle pages.
- `/admin/reusable-blocks`: reusable trust/support/promo blocks.
- `/admin/products`: product catalog.
- `/admin/blog`: content hub.

## Domain And URL Rules

Use one canonical domain source:

- Prefer `SITE_URL` in production environment.
- Also set Site Settings > Website URL in admin.
- Avoid hardcoding domains in components.
- Use `canonicalUrl()` or `normalizeSiteUrl()` for generated SEO URLs.

## Tracking Rules

Use dedicated settings fields for common tools:

- Meta Pixel IDs
- Google Tag Manager ID
- Microsoft Clarity ID
- Domain verification fields

Use Custom Code only for scripts that cannot be represented by these fields.

Custom code is cleaned before frontend rendering:

- Very large snippets are truncated.
- Unsafe form/object/embed/base tags are removed.
- Inline event handlers are removed.
- `javascript:` URL attributes are removed.

This is a safety layer, not a replacement for trusted admin access.

## HTML Content Rules

Several admin-managed fields render rich HTML. Only trusted admins should edit these fields.

Areas that can render rich HTML include:

- Page content
- Page freestyle rich text content
- Product/category/blog descriptions
- Reusable block body content

When adding new rich HTML fields, keep rendering contained to known content surfaces and avoid accepting public user HTML.

## White-Label Setup Flow

For a new client:

1. Configure environment variables.
2. Run Prisma migrations.
3. Login to admin.
4. Open `/admin/onboarding`.
5. Apply starter template only if needed.
6. Upload client logo and icon.
7. Set store name, website URL, and SEO defaults.
8. Add contact details.
9. Set design theme.
10. Configure header and footer.
11. Configure checkout, shipping, and COD.
12. Add categories and products.
13. Add legal/policy content.
14. Add tracking IDs.
15. Run production QA checklist.

## Starter Template Behavior

The onboarding starter template fills missing defaults only. It should not overwrite configured fields.

It can create:

- Generic policy pages
- Starter category
- Generic reusable blocks
- Default theme/settings JSON
- Default header and footer JSON
- Default checkout, cart, catalog, and global copy JSON

Future improvement: add named presets for different niches and export/import settings.

## Testing Before Deploy

Required:

- `npm run lint`
- `npm run build`
- `npx prisma migrate deploy`

Recommended smoke test:

- Home
- Shop
- Product
- Cart drawer
- Cart page
- Checkout
- Success page
- Admin settings
- Admin pages
- Admin products
- Admin blog
- Tracking scripts

Use `docs/production-qa-checklist.md` as the full release checklist.

## Known Technical Notes

- The project currently has existing lint warnings for `any`, hook dependencies, and some `<img>` usage. Step 20 build and lint pass with warnings only.
- Next.js reports the `middleware` convention as deprecated in favor of `proxy`. This is a framework warning and should be scheduled as a future maintenance task.
- Admin route protection currently depends on admin token cookies and environment tokens.
- Checkout is optimized for Pakistan customers and Cash on Delivery.

## Future Improvements

- Add import/export settings bundle.
- Add niche presets for fashion, electronics, cosmetics, groceries, and digital products.
- Add admin role permissions beyond basic admin/staff.
- Add automated Playwright smoke tests.
- Add image optimization audit and replace remaining raw `<img>` tags where practical.
- Migrate `middleware.ts` to the newer Next.js proxy convention when upgrading the routing layer.
- Keep admin Pages in freestyle rich-editor mode unless the client explicitly requests a block builder again.
