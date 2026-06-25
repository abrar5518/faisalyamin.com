# Production QA Checklist

Use this checklist before deploying or handing the store to a new client.

## Automated Checks

- Run `npm run lint`.
- Run `npm run build`.
- Confirm Prisma migrations are applied with `npx prisma migrate deploy`.
- Confirm required environment variables are present:
  - `DATABASE_URL`
  - `ADMIN_TOKEN`
  - `OWNER_TOKEN`
  - `SITE_URL` or the final production domain

## Storefront Smoke Test

- Home page loads without layout breakage.
- Header logo, menu, account, cart, and search visibility match admin settings.
- Footer columns, social links, trust text, and copyright match admin settings.
- Shop page loads products and filters correctly.
- Category and subcategory pages load product grids and SEO text.
- Product page loads images, price, add to cart, buy now, reviews, and SEO content.
- Add to Cart opens the cart drawer.
- Cart drawer quantity plus/minus/remove actions work.
- Cart page totals, coupon state, trust blocks, and checkout link work.
- Checkout page loads only focused checkout UI.
- Checkout validation scrolls to the first invalid field.
- Order placement works with Cash on Delivery.
- Success page shows order number, total, delivery message, and support button.

## Admin Smoke Test

- Admin login redirects unauthenticated users to `/admin/login`.
- Dashboard loads revenue, orders, catalog totals, and launch checklist status.
- Onboarding page loads checklist and can apply starter template on a test database.
- Settings tabs save and reload:
  - Branding
  - Design & Theme
  - Site Settings
  - Header & Footer
  - Global Copy
  - Contact
  - Shopping
  - Checkout
  - Shipping
  - Payments
  - SEO
  - Tracking
  - Custom Code
  - Security
- Pages can be created, edited, and rendered on frontend.
- Managed pages render freestyle rich text content only.
- Blog posts can be created, edited, and rendered.
- Products can be created, edited, and rendered on frontend.
- Categories and subcategories can be created and used by products.
- Reusable Blocks can be created and used on checkout, cart, product, and page builder.
- Orders can be viewed and status can be managed.

## SEO Checks

- `robots.txt` loads.
- `/sitemap.xml` loads.
- Sitemap child routes load:
  - `/sitemap/pages.xml`
  - `/sitemap/products.xml`
  - `/sitemap/categories.xml`
  - `/sitemap/subcategories.xml`
  - `/sitemap/blogs.xml`
  - `/sitemap/authors.xml`
- Admin, account, cart, checkout, login, signup, search, portal, and API routes are noindexed.
- Product/category/blog metadata uses configured title and description.
- Canonical URLs use the configured production domain.
- Open Graph image falls back to the configured logo/icon if available.

## Tracking Checks

- Meta Pixel PageView fires once.
- AddToCart event fires from product cards/product page/cart actions.
- InitiateCheckout fires on checkout page.
- Purchase fires on success page.
- Google Tag Manager loads only when a valid `GTM-` ID is configured.
- Microsoft Clarity loads only when a valid Clarity ID is configured.
- Custom scripts do not duplicate Meta Pixel, GTM, or Clarity snippets already managed by dedicated fields.

## Security Checks

- Admin routes require `admin_access_token`.
- Portal routes require `owner_access_token`.
- Admin, account, cart, checkout, portal, and API routes return `X-Robots-Tag: noindex, nofollow`.
- Custom code snippets are limited and cleaned before rendering.
- Avoid adding unknown third-party scripts outside Settings > Custom Code.
- Rich HTML content should be entered only by trusted admins.
- Production secrets are not committed to git.

## Mobile Checks

- Test at 360px, 390px, 430px, 768px, and desktop widths.
- Header does not overlap content.
- Product cards fit without text overflow.
- Cart drawer is usable with one hand.
- Checkout fields have large touch targets.
- Mobile sticky checkout/order action does not cover required content.
- WhatsApp floating button does not block checkout submit.

## Final Handoff

- Complete `/admin/onboarding` required tasks.
- Replace placeholder logo, domain, phone, WhatsApp, email, and address.
- Add real product images and descriptions.
- Confirm shipping fee and COD policy.
- Confirm legal pages with the client.
- Confirm tracking IDs with the client's ad account owner.
