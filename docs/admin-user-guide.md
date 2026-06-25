# Admin User Guide

This guide is for store owners and staff who manage the ecommerce website from admin.

## Daily Workflow

1. Open `/admin/dashboard`.
2. Check pending orders.
3. Review launch checklist status if the store is still being configured.
4. Add or update products.
5. Review customer messages and subscriptions.
6. Check tracking/settings only when needed.

## Onboarding A New Client

Open `/admin/onboarding`.

Complete every required item:

- Upload logo and store name.
- Set website URL/domain.
- Add WhatsApp, phone/email, and address.
- Set brand colors and theme.
- Configure header menu.
- Configure footer links and text.
- Configure checkout, COD, and shipping fee.
- Create categories.
- Add active products.
- Prepare core pages.

Use **Apply starter template** only on a fresh or test setup. It fills missing generic defaults without overwriting already configured fields.

## Branding And Theme

Go to `/admin/settings`.

Use:

- **Branding** for logo, icon, and public brand identity.
- **Design & Theme** for colors, radius, and fonts.
- **Site Settings** for URL/domain and store identity.

Keep the logo clear and readable on mobile. Use one primary color for buttons and one accent color for highlights.

## Header And Footer

Use **Header & Footer** in settings.

Recommended header links:

- Shop
- Categories
- Deals, if used
- Blog, if content exists
- Contact, if support is important for the niche

Recommended footer links:

- Shipping
- Returns
- Privacy Policy
- Terms & Conditions
- FAQ
- Contact

## Contact Details

Use `/admin/contact`.

Fill:

- WhatsApp number
- Phone number or email
- Full address
- Business hours

WhatsApp is used by checkout, support buttons, and floating help actions.

## Products

Use `/admin/products`.

For each product:

- Add clear product name.
- Add category and subcategory if applicable.
- Add price and compare-at price if on sale.
- Add high quality images.
- Add short description.
- Add full description.
- Add SEO title and description.
- Enable product when ready.

Avoid publishing products with missing images or unclear descriptions.

## Categories And Shop

Use `/admin/categories`, `/admin/subcategories`, and `/admin/shop`.

Categories should be understandable for customers. Avoid too many categories at the start. For a new store, 3 to 7 strong categories are usually enough.

## Pages

Use `/admin/pages`.

The Pages hub is organized into clear groups:

- Core Storefront: Home
- Commerce: Shop, Deals, Categories
- Content: Blog, About, Contact, FAQ, Reviews
- Policies: Shipping, Returns, Privacy, Terms

Each page follows the same editing pattern:

- Basics
- Long description / page content
- FAQs
- Feature image
- SEO metadata

Pages use a freestyle rich text editor. Add the complete page content inside the editor and use the feature image/SEO fields for previews and search metadata. Use the FAQ template button when a page needs common customer questions.

## Blog

Use `/admin/blog`.

Blog is useful for SEO and buyer education. Keep posts relevant to products and customer problems. Link products inside blog posts where appropriate.

## Reusable Blocks

Use `/admin/reusable-blocks`.

Reusable blocks are for content that appears in multiple places:

- Trust badges
- COD message
- Delivery message
- Return policy snippet
- WhatsApp help card
- Promo banner
- Product shipping info
- Checkout reassurance

Edit once, reuse many times.

## Checkout Settings

Use Settings > Checkout.

For Pakistan ecommerce, keep checkout simple:

- Phone number first
- Full name second
- Email optional or hidden
- City dropdown
- Full address textarea
- Cash on Delivery visible

Do not add extra fields unless absolutely required.

## Tracking And Custom Code

Use Settings > Tracking for:

- Meta Pixel IDs
- Google Tag Manager ID
- Microsoft Clarity ID
- Domain verification

Use Settings > Custom Code only when a script cannot be handled by the dedicated fields.

Do not paste Meta Pixel, GTM, or Clarity snippets into Custom Code if IDs are already configured in Tracking. That can duplicate events.

## Orders

Use `/admin/orders`.

Recommended order flow:

1. Pending
2. Confirmed
3. Processing
4. Ready to Ship
5. Shipped
6. Out for Delivery
7. Delivered

Cancel only when the customer cancels, details are invalid, or stock is unavailable.

## Before Launch

Open `/admin/onboarding` and complete all required tasks.

Then run the production QA checklist in `docs/production-qa-checklist.md`.
