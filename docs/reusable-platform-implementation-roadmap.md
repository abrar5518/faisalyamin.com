# Reusable Ecommerce Platform Implementation Roadmap

## Purpose

Yeh roadmap implementation ke liye step-by-step guide hai. Isko follow karke Sahoolat app ko reusable, admin-controlled, white-label ecommerce platform mein convert kiya ja sakta hai.

Rule: Har step ko alag implement, test, aur verify karna hai. Ek step complete hone ke baad next step start karein.

---

## Step 0: Baseline Safety And Audit

### Goal

Current website ko break kiye bina clean starting point create karna.

### Tasks

- Current build run karke baseline confirm karein.
- Existing checkout, cart drawer, tracking events, admin login, products, orders, pages, settings verify karein.
- Static frontend copy/headings ki list banayein.
- Existing admin modules ki list banayein.
- Existing settings models ka mapping banayein:
  - `SiteSettings`
  - `StoreSettings`
  - `Contact`
  - `Page`
  - `Blog`
- Existing tracking event locations document karein:
  - Add to Cart
  - Begin Checkout
  - Purchase

### Acceptance Criteria

- Build pass ho.
- Existing user journey break na ho:
  - Product add to cart
  - Cart drawer open
  - Checkout page
  - Order success
  - Admin settings save
- Tracking event locations documented hon.

### Test

- `npm run build`
- Manual flow:
  - Home -> Product -> Add to Cart -> Checkout -> Place Order
  - Admin -> Settings -> Save

---

## Step 1: Admin Sidebar And Information Architecture Cleanup - Completed

### Goal

Admin panel ko client-friendly aur organized banana.

### Status

Completed on 2026-06-12.

### Implementation Notes

- Admin sidebar navigation grouped into Dashboard, Content, Store, Orders, Marketing, and Settings.
- Existing admin route URLs were preserved.
- Active route highlighting was added through a small client-side navigation component.
- Professional Lucide icons were added for every admin nav item.
- Sidebar logo/name area was improved with a safe generic fallback.
- Admin sidebar remains desktop-only as before, so existing mobile admin layout behavior is not changed in this step.

### Tasks

- [x] `AdminSidebar` ko grouped navigation mein convert karein.
- [x] Current flat menu ko sections mein divide karein:
  - Dashboard
  - Content
  - Store
  - Orders
  - Marketing
  - Design
  - Settings
- [x] Existing routes ko same rakhein, sirf admin navigation improve karein.
- [x] Sidebar labels clean karein.
- [x] Active state clear karein.
- [x] Mobile admin sidebar behavior check karein.

### Suggested Grouping

Dashboard:

- Dashboard

Content:

- Pages
- Blog
- Contact

Store:

- Products
- Categories
- Subcategories
- Shop
- Reviews

Orders:

- Orders
- Customers
- Subscriptions

Marketing:

- Coupons
- Loyalty

Settings:

- Settings
- APIs

### Files/Areas

- `src/components/admin/AdminSidebar.tsx`
- Admin layout if needed:
  - `src/app/admin/(panel)/layout.tsx`

### Acceptance Criteria

- Admin sidebar grouped and professional lage.
- Existing admin routes break na hon.
- Active menu state still work kare.
- No database changes.

### Test

- Visit each admin menu item.
- Confirm all routes load.
- Run build.

---

## Step 2: Shared Admin UI Components - Completed

### Goal

Admin screens ko consistent aur professional banane ke liye shared components create karna.

### Status

Completed on 2026-06-12.

### Implementation Notes

- Created reusable admin UI primitives under `src/components/admin/ui/`.
- Added shared components for page headers, cards, sections, fields, tabs, save bars, empty states, and status badges.
- Added a barrel export file so future admin pages can import from one path.
- Applied first real usage on the admin dashboard with `AdminPageHeader`, `AdminCard`, and `AdminStatusBadge`.
- Kept components presentational and lightweight so Step 3 settings cleanup can reuse them without forcing database/API changes.

### Tasks

Create reusable components:

- [x] `AdminPageHeader`
- [x] `AdminCard`
- [x] `AdminTabs`
- [x] `AdminSection`
- [x] `AdminField`
- [x] `AdminSaveBar`
- [x] `AdminEmptyState`
- [x] `AdminStatusBadge`

Start with minimal components. Over-engineering avoid karein.

### Files/Areas

Suggested folder:

- `src/components/admin/ui/`

### Acceptance Criteria

- [x] Components reusable hon.
- [x] Existing UI style se match karein.
- [x] At least one admin page mein first usage ho.
- [x] No unrelated admin logic rewrite.

### Test

- TypeScript check/build.
- Admin dashboard visual check.

---

## Step 3: Settings Hub Cleanup - Completed

### Goal

Settings ko clear tabs/sub-pages mein organize karna taake client easily control kar sake. Settings ka single long page nahi rehna chahiye; har major setting category ka apna focused area hona chahiye.

### Status

Completed on 2026-06-12.

### Implementation Notes

- Rebuilt the admin settings page into a focused Settings Hub with tab-style sections.
- Existing `site-settings`, `store-settings`, and `security` APIs were preserved.
- No database migration was introduced in this step.
- Current settings are now separated into Branding, Site Settings, Header & Footer, Contact & Support, Shopping / Store, Checkout, Shipping, Payments, SEO, Tracking & Integrations, Custom Code, and Security.
- Tracking IDs and custom scripts are now visually separated, reducing client confusion and script placement mistakes.
- Contact settings are linked to the dedicated Contact admin area instead of duplicating those fields.
- Existing save/load behavior remains intact, with separate save actions per focused settings area.
- Old settings page TypeScript/lint warnings caused by local `any` and hook dependency patterns were cleaned up during the refactor.
- Duplicate controls were removed after review:
  - Website URL is managed only in Site Settings.
  - The old store domain field is synced from Site URL for backward compatibility instead of being shown as a second input.
  - Payment method toggles are editable only in Payments, not duplicated in Checkout.
- Settings rule added for future work: one setting should have one owner screen, and other tabs should only reference/link to that source of truth.

### Tasks

Current settings page ko proper Settings Hub mein convert karein. MVP mein tabs use kiye ja sakte hain; agar page bohat heavy ho jaye to nested routes/sub-pages use karein.

Recommended structure:

- Branding
  - Site name
  - Store/public name
  - Logo
  - Mobile logo optional
  - Site icon/favicon
  - Logo alt text
  - Brand tagline
- Site Settings
  - Site URL/domain
  - Default locale
  - Timezone
  - Currency and price format
  - Default SEO title/description
  - Indexing/robots controls
- Header Settings
  - Header menu selection
  - Search visibility
  - Account/cart visibility
  - Announcement bar
  - Support text/phone visibility
- Footer Settings
  - Footer text
  - Footer columns/links
  - Newsletter block
  - Social links
  - Payment/trust badges
- Contact & Support
  - Phone
  - WhatsApp
  - Email
  - Address
  - Business hours
  - Support message templates
- Shopping / Store
  - Product display defaults
  - Reviews enabled/disabled
  - Stock behavior
  - Product badges/labels later
  - Shop page defaults
- Checkout
  - Checkout copy
  - Required/optional fields
  - City list
  - Trust badges
  - Order success copy
  - WhatsApp help text
- Shipping
  - Default shipping fee
  - Free shipping threshold
  - Delivery time text
  - Shipping zones later
- Payments
  - Cash on Delivery
  - Bank transfer later
  - Card/gateway settings later
  - Payment instructions
- SEO
  - Default meta title
  - Default meta description
  - Open Graph image
  - Organization schema data
  - Sitemap/robots controls
- Tracking & Integrations
  - Meta Pixel
  - Google Tag Manager
  - Google verification
  - Facebook verification
  - Microsoft Clarity
  - Future pixels such as TikTok/Google Ads
- Custom Code
  - Head scripts
  - Body start scripts
  - Body end scripts
  - Enable/disable per script
  - Safety warning for clients
- Security
  - Admin password/security controls
  - Login/session settings later
  - Admin users/roles later

Implementation rule:

- Existing settings data should keep working.
- Do not remove current fields while reorganizing UI.
- First split UI cleanly; database refactor can happen later only where needed.
- Every tab/page should have one clear save action and clear success/error state.
- Advanced technical settings such as tracking and custom code should be visually separated from simple brand/store settings.

Important: Pehle same existing APIs/models use karein. New DB model abhi avoid karein jab tak zaroori na ho.

### Files/Areas

- `src/app/admin/(panel)/settings/page.tsx`
- Existing settings APIs:
  - `src/app/api/admin/settings/`
  - `src/app/api/site-settings/`

### Acceptance Criteria

- [x] Same settings save/load hon.
- [x] Settings long mixed page ke bajaye clear tabs/sub-pages mein organized hon.
- [x] Branding, Site Settings, Shopping/Store, Tracking & Integrations, Custom Code, Contact, Checkout, Shipping, Payments, SEO, Footer/Header, Security clearly separate hon.
- [x] Form easier and cleaner ho.
- [x] Tracking/custom scripts fields still available hon aur apni dedicated area mein hon.
- [x] Logo/site icon fields still available hon.
- [x] No current setting lost.
- [x] Future admin settings add karne ke liye clear pattern available ho.

### Test

- Settings screen compile verified through production build.
- Lint verified.
- Save flows still use existing APIs:
  - `/api/admin/site-settings`
  - `/api/admin/store-settings`
  - `/api/admin/security`
- Manual admin browser save checks should be done before deploying to production.
- Build pass.

---

## Admin Module Organization Rule

### Goal

Settings ke ilawa admin side ke baqi heavy/unclear modules ko bhi isi principle par improve karna hai.

### Rule

Agar koi admin page:

- Bohat lamba ho
- Mixed responsibilities rakhta ho
- Client ko confuse karta ho
- Multiple unrelated settings/forms ek hi screen par dikhata ho
- Future mein reusable platform ke liye scale nahi hota

To us module ko tabs, sub-pages, grouped cards, ya separate focused screens mein divide karna roadmap ka hissa hoga.

### Examples

Pages / Content:

- Pages
- Blog
- Menus
- Reusable Blocks
- FAQs
- Media Library

Products:

- Basic info
- Images
- Pricing
- Inventory/variants
- SEO
- FAQs
- Related products

Orders:

- Order details
- Customer details
- Payment
- Shipping
- Status history
- Notes

Marketing:

- Coupons
- Loyalty
- Banners
- Promo blocks
- Tracking campaigns later

Settings:

- Branding
- Site Settings
- Shopping / Store
- Tracking & Integrations
- Custom Code
- Contact & Support
- Checkout
- Shipping
- Payments
- SEO
- Security

### Acceptance Criteria

- Admin screens should feel manageable for non-technical clients.
- Each screen should have one clear purpose.
- Advanced controls should not distract from basic controls.
- Existing functionality should be preserved while improving structure.

---

## Step 4: Generic Fallback Content Cleanup - Completed

### Goal

Codebase se old niche/brand fallback remove karna.

### Status

Completed on 2026-06-12.

### Implementation Notes

- Removed old `LuxStore`, luxury watch, Rolex, and water-bottle wording from safe fallback/default/admin placeholder areas.
- Replaced generic site metadata fallback with reusable ecommerce copy.
- Replaced header search placeholders with generic product/category/deal search copy.
- Replaced footer fallback description and newsletter text with generic ecommerce wording.
- Replaced home sale carousel fallback heading/description with generic deal copy.
- Replaced admin-created default Home, About, Deals, and Shop payloads with reusable ecommerce defaults.
- Replaced admin category, subcategory, blog, and product placeholders with generic examples.
- Replaced default analytics item category with `Products`.
- Replaced product page fallback category/description and related-product fallback data with generic product wording.
- Cart localStorage key was renamed to a generic key while preserving a legacy `luxstore:cart` migration path so existing carts are not lost.
- Public water-bottle SEO/content pages are intentionally left for later dynamic page conversion steps, because those pages should be handled through the content/page-builder roadmap rather than a risky broad rewrite.

### Tasks

- [x] Hardcoded fallback values replace karein:
  - `LuxStore`
  - luxury watches
  - water bottle specific fallback copy
  - old random product niche text
- [x] Generic ecommerce fallback use karein.
- [x] Prefer settings values where available.
- [x] Public frontend aur admin default data dono check karein.

### Files/Areas

Search terms:

- `LuxStore`
- `luxury`
- `watch`
- `water bottle`
- `Water Bottles`
- `bottle`

### Acceptance Criteria

- [x] Safe fallback/default/admin placeholder areas kisi one niche se tied na lagen.
- [x] Existing real admin data override hota rahe.
- [x] No product/category data delete na ho.
- [x] Existing cart data preserve rahe through legacy key migration.

### Test

- Focused fallback scan clean, except intentional legacy cart migration key.
- Lint pass.
- Build pass.

---

## Step 5: Contact Settings Everywhere - Completed

### Goal

Phone, WhatsApp, email, address, support links ek central contact setting se chalain.

### Status

Completed on 2026-06-12.

### Implementation Notes

- Added shared contact helper utilities in `src/lib/contact.ts`.
- Floating WhatsApp button now reads `/api/contact` and builds its WhatsApp link from the admin-managed contact WhatsApp number.
- Checkout help WhatsApp button now reads the admin-managed WhatsApp number instead of a hardcoded number.
- Order success WhatsApp support button now reads the admin-managed WhatsApp number and includes the order number in the message when available.
- Account sidebar WhatsApp support now uses the shared contact helper.
- Footer contact area now uses the shared WhatsApp helper and no longer shows a hardcoded fallback email.
- Contact page metadata was cleaned up to generic customer-support wording.
- Hardcoded WhatsApp/support scans are clean for the touched support surfaces.
- No database migration was introduced; existing `Contact.whatsapp`, `Contact.phone`, and `Contact.email` fields remain the source of truth.

### Tasks

- [x] Existing `Contact` settings ko frontend helpers ke through use karein.
- [x] Replace hardcoded WhatsApp/support/contact values in:
  - Header/support links were already routed to contact page.
  - Footer
  - Floating WhatsApp button
  - Contact page metadata
  - Checkout help section
  - Order success page
  - Account sidebar support
- [x] WhatsApp default message helper add hua. Fully admin-managed message field future checkout/global-copy settings mein add ho sakta hai.

### Files/Areas

- `src/app/admin/(panel)/contact/page.tsx`
- `src/app/api/contact/`
- `src/components/SiteHeader.tsx`
- `src/components/SiteFooter.tsx`
- `src/components/WhatsAppFloatButton.tsx`
- `src/app/contact/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/checkout/success/page.tsx`

### Acceptance Criteria

- [x] Admin contact update karne se frontend WhatsApp support locations update hon.
- [x] WhatsApp buttons correct admin-managed number use karein.
- [x] Checkout help card dynamic contact values use kare.
- [x] Missing WhatsApp number safely falls back to `/contact`.

### Test

- Hardcoded WhatsApp/support scan pass.
- Lint pass.
- Build pass.
- Manual admin contact update should be checked in browser before deploy.

---

## Step 6: Dynamic Header Settings And Menus - Completed

### Goal

Header navigation and top content admin se control karna.

### Status

Completed on 2026-06-12.

### Implementation Notes

- Added header configuration fields to `SiteSettings` with a Prisma migration.
- Added reusable header settings helpers for parsing/sanitizing menu JSON safely.
- Header menu labels/URLs are now admin-manageable from Settings Hub > Header & Footer.
- Search placeholder is now admin-managed.
- Announcement/top strip is now admin-managed with optional link support.
- Header visibility toggles were added for search, account button, cart button, and track/support links.
- Public header now reads `/api/site-settings` and `/api/store-settings` for logo, menu, announcement, visibility, and shipping fee fallback text.
- Existing logo API flow remains intact.
- Existing cart drawer behavior remains intact; the cart button still calls the global cart drawer open action when enabled.
- Applied the migration locally with `prisma migrate deploy` and regenerated Prisma Client.

### Tasks

Initial simple version:

- [x] Add header menu config in settings JSON or existing settings fields.
- [x] Header nav labels/URLs admin-manageable karein.
- [x] Search placeholder setting-driven karein.
- [x] Announcement/top strip setting-driven karein.
- [x] Header support/cart/account visibility settings add karein.

Better later version:

- Dedicated `NavigationMenu` and `NavigationMenuItem` models.

### Recommended MVP Fields

- Header menu items JSON
- Search placeholder
- Announcement enabled
- Announcement text
- Announcement link
- Show search
- Show account
- Show cart

### Files/Areas

- `SiteSettings` or `StoreSettings`
- `src/components/SiteHeader.tsx`
- `src/app/admin/(panel)/settings/page.tsx`
- Settings API

### Acceptance Criteria

- [x] Header menu no longer hardcoded.
- [x] Admin can change nav labels and URLs.
- [x] Logo still comes from API.
- [x] Cart drawer still works.

### Test

- Prisma Client regenerated.
- Prisma migration applied locally.
- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Change header menu in admin.
  - Refresh frontend.
  - Add to cart still opens drawer.

---

## Step 7: Dynamic Footer Settings And Menus - Completed

### Goal

Footer text, columns, legal links, support info, newsletter copy admin se control karna.

### Status

Completed on 2026-06-12.

### Implementation Notes

- Added footer configuration fields to `SiteSettings` with a Prisma migration.
- Added reusable footer settings helpers for safe parsing/sanitizing of footer columns, trust items, and social links.
- Settings Hub > Header & Footer now includes a real footer builder:
  - footer description
  - copyright text with `{{year}}` and `{{siteName}}` tokens
  - footer columns and links
  - newsletter enable/title/subtitle/consent text
  - trust strip items
  - optional social links
- Public footer now reads `/api/site-settings` for footer configuration and `/api/contact` for contact details.
- Footer link columns are no longer hardcoded in the frontend.
- Contact details remain centralized in Contact settings.
- Removed old hardcoded copyright brand text from the footer fallback.
- Applied the migration locally with `prisma migrate deploy` and regenerated Prisma Client.

### Tasks

- [x] Footer columns dynamic karein.
- [x] Footer copyright dynamic karein.
- [x] Footer description dynamic karein.
- [x] Footer contact block use contact settings.
- [x] Newsletter title/subtitle dynamic karein.
- [x] Payment/trust strip dynamic or configurable karein.

### Recommended MVP Fields

- Footer description
- Footer copyright
- Footer columns JSON
- Newsletter enabled
- Newsletter title
- Newsletter subtitle
- Trust strip items JSON
- Social links JSON

### Files/Areas

- `src/components/SiteFooter.tsx`
- Settings page/API

### Acceptance Criteria

- [x] Footer links and text admin se update hon.
- [x] No hardcoded footer column labels needed.
- [x] Contact info central settings se aaye.

### Test

- Prisma migration applied locally.
- Prisma Client regenerated.
- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Admin footer update.
  - Check desktop/mobile footer.
  - Confirm contact details still come from Contact settings.

---

## Step 8: Global Copy Settings - Completed

### Goal

Repeated labels/copy ko central admin settings se control karna.

### Status

Completed on 2026-06-13.

### Implementation Notes

- Added `globalCopy` JSON field to `SiteSettings` with a Prisma migration.
- Added `src/lib/globalCopy.ts` for typed defaults, safe parsing, serialization, and token rendering.
- Added `GlobalCopyProvider` globally in the root layout so common copy is available across client components.
- Added a dedicated Settings Hub > Global Copy tab.
- Admin can now manage reusable copy for:
  - product buttons
  - cart drawer
  - cart page
  - checkout button/COD labels
  - trust text
- Wired global copy into:
  - Add to Cart button
  - Buy Now button
  - product detail CTAs
  - product sale card CTA
  - cart drawer
  - cart page
  - checkout visible place-order/COD labels
  - checkout success Continue Shopping label
- Existing UI keeps safe fallbacks if `globalCopy` is missing or invalid.
- Tracking events were not changed.

### Tasks

Create a simple global copy system.

Copy groups:

- Cart
- Checkout
- Product
- Search
- Empty states
- Trust messages
- Buttons

Examples:

- Add to Cart
- Buy Now
- View Cart
- Checkout
- Continue Shopping
- Empty cart message
- Search placeholder
- COD available message

### Implementation Options

MVP:

- [x] Add JSON field in `SiteSettings` or `StoreSettings`.

Better:

- Create `GlobalCopy` table.

Recommended: Start with JSON to move faster, table later if needed.

### Acceptance Criteria

- [x] Common labels editable from admin.
- [x] Existing UI still has safe fallbacks.
- [x] No layout break due to long text.

### Test

- Prisma migration applied locally.
- Prisma Client regenerated.
- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Change button/empty state copy.
  - Check product cards, cart drawer, cart page, checkout.

---

## Step 9: Checkout Settings - Completed

### Goal

Conversion-focused checkout ko dynamic aur client-configurable banana.

### Status

Completed on 2026-06-13.

### Implementation Notes

- Added `checkoutSettings` JSON field to `SiteSettings` with a Prisma migration.
- Added `src/lib/checkoutSettings.ts` for typed defaults, parsing, serialization, list helpers, and simple success-page template tokens.
- Settings Hub > Checkout is now a real admin-managed checkout configuration area.
- Admin can manage checkout step labels, phone/name/email/address copy, email visibility mode, city list, trust badges, WhatsApp help labels, empty cart message, and order success copy.
- Place order and COD button labels remain in Global Copy to avoid duplicate settings ownership.
- Payment availability remains in Payments tab and shipping fee remains in Shipping/Store settings, so duplicate controls were not introduced.
- Checkout page now reads checkout settings from `/api/site-settings`, shipping fee from `/api/store-settings`, and WhatsApp support from Contact settings.
- Checkout success page now reads success copy from checkout settings while preserving Meta Pixel and Google purchase tracking calls.
- Mobile checkout CTA behavior remains as previously approved, including the COD-section button and final confirm-order button.
- Applied the migration locally with `prisma migrate deploy` and regenerated Prisma Client.

### Tasks

- [x] Add checkout settings section in admin.
- [x] Make these admin-editable:
  - Step labels
  - Phone helper text
  - Name placeholder
  - Email mode: hidden/optional/required
  - City list
  - Address helper text
  - COD title
  - COD helper text
  - Trust badges
  - Place order button text/subtext
  - Success page title/copy
  - Expected delivery text
- [x] Shipping value use store settings.
- [x] WhatsApp support use contact settings.

### Files/Areas

- [x] `src/app/checkout/page.tsx`
- [x] `src/app/checkout/success/page.tsx`
- [x] Admin settings page/API
- [x] `StoreSettings` / settings JSON

### Acceptance Criteria

- [x] Checkout remains simple and mobile-first.
- [x] Mobile button placement remains as currently optimized.
- [x] Two mobile CTAs remain if approved.
- [x] COD flow still obvious.
- [x] Meta Pixel and Google events remain.

### Test

- Empty-form validation and first-invalid-field scroll logic preserved in code.
- Test order flow remains wired through the existing checkout API.
- Purchase event calls remain present on success page:
  - Meta Pixel `trackPurchase`
  - Google `trackPurchase`
- Prisma migration applied locally.
- Prisma Client regenerated.
- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Change Checkout settings in admin.
  - Check `/checkout` on mobile.
  - Place a COD test order.
  - Check `/checkout/success`.

---

## Step 10: Dynamic Cart Page And Cart Drawer Copy - Completed

### Goal

Cart drawer/page ko reusable aur admin-controlled banana.

### Status

Completed on 2026-06-13.

### Implementation Notes

- Added `cartSettings` JSON field to `SiteSettings` with a Prisma migration.
- Added `src/lib/cartSettings.ts` for typed defaults, safe URL parsing, serialization, and money-setting parsing.
- Extended Global Copy with the missing cart labels used on the cart page and drawer:
  - subtotal, shipping, discount, total
  - item count, add more, remove item
  - free shipping progress/unlocked messages
  - coupon applied/remove labels
  - breadcrumb and mobile sticky summary text
- Added Settings Hub controls for cart links and behavior:
  - continue shopping URL
  - empty cart primary/secondary URLs
  - support URL
  - track order URL
  - free shipping progress visibility
- Cart drawer now reads:
  - cart behavior from `/api/site-settings`
  - shipping fee and free-shipping threshold from `/api/store-settings`
  - cart labels from Global Copy
- Cart page now reads:
  - cart behavior from `/api/site-settings`
  - default shipping fee and free-shipping threshold from `/api/store-settings`
  - labels/messages from Global Copy
- Free shipping threshold now affects cart-page shipping total before checkout.
- Existing cart state, quantity update, remove item, coupon validation, cart drawer behavior, and view-cart tracking were preserved.
- Applied the migration locally with `prisma migrate deploy` and regenerated Prisma Client.

### Tasks

- [x] Cart empty state message from global copy/settings.
- [x] Continue shopping link from settings.
- [x] Cart trust text from settings.
- [x] Shipping/free shipping text from settings.
- [x] Cart drawer labels from global copy.
- [x] Checkout/cart button labels from settings.

### Files/Areas

- [x] `src/components/cart/CartSidebar.tsx`
- [x] Cart context/provider preserved; no risky state rewrite needed.
- [x] `src/app/cart/page.tsx`
- [x] Settings/global copy helper

### Acceptance Criteria

- [x] Existing cart state works globally.
- [x] Add to cart still opens drawer.
- [x] Cart page still works.
- [x] Copy configurable from admin.

### Test

- Prisma migration applied locally.
- Prisma Client regenerated.
- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Add/increase/decrease/remove cart item.
  - Confirm cart drawer opens after add-to-cart.
  - Check mobile cart drawer.
  - Check cart page totals/free shipping.
  - Save Global Copy > cart labels and verify frontend.

---

## Step 11: Page Builder Foundation - Reverted For Production

### Goal

Public pages ko flexible sections ke through manage karna.

### Status

Completed on 2026-06-13, then reverted on 2026-06-18 after production review.

### Production Decision

- Page builder/block sections were removed from the admin Pages UI.
- Public pages now render freestyle rich text `contentHtml` only.
- The `sectionsJson` database field is left in place for migration safety but is no longer used by the frontend.
- `src/lib/pageBuilder.ts`, `src/components/admin/pages/PageSectionEditor.tsx`, and `src/components/page-builder/PageSectionsRenderer.tsx` were removed.
- Newly created pages still render through `/[slug]`, but they use title, short description, feature image, SEO fields, and freestyle rich content.

### Historical Implementation Notes

- Originally added `Page.sectionsJson` as the MVP page-builder storage field with a Prisma migration.
- Originally added typed page-builder utilities in `src/lib/pageBuilder.ts`:
  - section types
  - defaults
  - safe parsing
  - serialization
- Originally added a reusable admin section editor:
  - `src/components/admin/pages/PageSectionEditor.tsx`
- Originally added a reusable frontend renderer:
  - `src/components/page-builder/PageSectionsRenderer.tsx`
- Supported initial section types:
  - Hero
  - Rich Text
  - Product Grid
  - Category Grid
  - FAQ
  - Trust Badges
  - CTA
  - Image + Text
- Admin Pages edit screen no longer supports adding, editing, enabling/disabling, reordering, or removing page-builder sections.
- Existing freestyle page content/SEO fields remain active.
- Pages API can still receive `sectionsJson` for migration compatibility, but production UI clears/ignores it.
- Added a generic public page route at `/[slug]` so newly created admin pages can render publicly without custom code.
- Existing static routes still take priority over `/[slug]`, and the production build confirms routing is valid.
- Shop and Deals pages no longer render page-builder sections; they use their existing product/content layouts.
- Applied the migration locally with `prisma migrate deploy` and regenerated Prisma Client.

### Tasks

- [x] Add `PageSection` JSON support historically.
- [x] Remove frontend section renderer from production.
- [x] Remove admin section editor from production.
- [x] Support initial section types:
  - Hero
  - Rich Text
  - Product Grid
  - Category Grid
  - FAQ
  - Trust Badges
  - CTA
  - Image + Text
- [x] Keep existing `Page` fields working during transition.

### Files/Areas

- [x] `prisma/schema.prisma`
- [x] `src/app/admin/(panel)/pages/`
- [x] `src/app/api/admin/pages/`
- [x] Public route added at `src/app/[slug]/page.tsx`
- [x] Freestyle managed content renderer:
  - `src/components/ManagedPageBody.tsx`

### Acceptance Criteria

- [x] Admin pages use freestyle editor only.
- [x] Frontend ignores old saved sections.
- [x] Old pages still render.
- [x] Generic public pages render without custom code.

### Test

- Prisma migration applied locally.
- Prisma Client regenerated.
- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Edit a page in Admin > Pages.
  - Confirm the freestyle rich editor is visible.
  - Save content and confirm no section block UI is visible.
  - Visit the page slug on frontend.
  - Check Shop/Deals after adding optional sections.

---

## Step 11A: Pages Admin Hub Cleanup - Completed

### Goal

Pages admin ko modern, organized, aur client-friendly banana taake Home, Shop, Deals, Blog listing, static pages, policy pages, aur custom pages ek consistent pattern se manage hon.

### Status

Completed on 2026-06-18.

### Implementation Notes

- Rebuilt `/admin/pages` as a grouped Pages hub:
  - Core Storefront
  - Commerce
  - Content
  - Policies
- Added system page cards for:
  - Home
  - Shop
  - Deals
  - Categories
  - Blog
  - About
  - Contact
  - FAQ
  - Shipping
  - Returns
  - Privacy
  - Terms
  - Reviews
- Added search across page title, slug, group, and purpose.
- Added one-click creation for missing system pages with safe default content, metadata, and fallback images where useful.
- Rebuilt custom page creation so it now follows the same professional pattern as page editing.
- Standardized page edit/create screen order:
  - Basics
  - Long description / page content
  - FAQs
  - Feature image
  - SEO metadata
- Page save now syncs title, short description, and feature image into matching hero fields so Home, About, Blog listing, and Categories can use the same admin-managed basics cleanly.
- Blog create/edit forms were aligned with the same content pattern:
  - Basics
  - Long description / article content
  - FAQs
  - Related products
  - Cover image
  - SEO metadata

### Tasks

- [x] Organize all major storefront pages in `/admin/pages`.
- [x] Add missing system page creation workflow.
- [x] Make custom page creation production-ready instead of title/slug only.
- [x] Keep freestyle page content model, no page-builder blocks.
- [x] Make FAQ and SEO sections appear in predictable locations.
- [x] Align blog create/edit pattern with pages.

### Files/Areas

- `src/app/admin/(panel)/pages/page.tsx`
- `src/app/admin/(panel)/pages/create/page.tsx`
- `src/app/admin/(panel)/pages/[slug]/edit/page.tsx`
- `src/app/admin/(panel)/blog/create/page.tsx`
- `src/app/admin/(panel)/blog/[id]/edit/page.tsx`
- `docs/admin-user-guide.md`
- `docs/developer-handoff-notes.md`

### Test

- `npm run lint` pass with existing warnings only.
- `npm run build` pass.
- Manual checks recommended:
  - Open `/admin/pages`.
  - Create missing system pages.
  - Edit Home, Deals, Shop, Blog, and policy pages.
  - Confirm field order is consistent.
  - Confirm public Home/Shop/Deals/Blog pages still load.

---

## Step 12: Convert Home Page To Dynamic Sections - Reverted For Production

### Goal

Home page ko code-hardcoded sections se page builder controlled banana.

### Production Decision

- Home page no longer switches to Page Builder rendering.
- Existing home layout remains active and still reads safe dynamic fields such as hero copy, sale settings, benefits, FAQs, testimonials, products, categories, contact, and site settings.
- Admin Pages no longer auto-populates or edits Home page builder sections.

### Status

Completed on 2026-06-13.

### Historical Implementation Notes

- Home page previously supported the Page Builder renderer from Step 11.
- Production now always uses the existing home layout instead of saved page-builder sections.
- If no Home sections are saved yet, the old layout remains as a safe fallback so the site does not visually break.
- Admin > Pages > Home no longer auto-populates page-builder sections.
- Home-specific fields still drive the existing home layout where applicable.
- Product section source selection is no longer part of admin Pages.
- Home metadata and fallback copy were cleaned to generic ecommerce language instead of water-bottle-specific copy.
- Existing Home-specific fields still work during the transition, including hero fields, sale limit, intro, benefits, FAQs, and testimonials fallback.
- Existing schemas, product/category queries, and SEO behavior were preserved.

### Tasks

- [x] Map current home sections to page sections.
- [x] Move hero/title/subtitle/buttons to admin.
- [x] Move featured products/categories/deals settings to admin.
- [x] Keep trust badges/FAQ/testimonials managed through existing home/settings/admin fields, not page-builder blocks.
- [x] Keep SEO metadata dynamic.

### Files/Areas

- `src/app/page.tsx`
- Home components under `src/components/home/`
- Page builder renderer/admin

### Acceptance Criteria

- [x] Home page main content admin se change ho.
- [x] No hardcoded niche heading in the Home fallback copy.
- [x] Existing product/category display still works.

### Test

- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Admin > Pages > Home edit.
  - Confirm page-builder sections do not appear.
  - Save Home page.
  - Check `/` renders the section-based home page.
  - Enable/disable and reorder Home sections.
  - Check mobile/desktop.

---

## Step 13: Convert Static Info Pages - Completed

### Goal

Legal/info pages ko admin-managed pages banana.

### Status

Completed on 2026-06-13.

### Implementation Notes

- Added shared managed-page utilities in `src/lib/managedPage.ts` for admin-driven metadata, page lookup, and content detection.
- Added reusable freestyle frontend renderer wrapper in `src/components/ManagedPageBody.tsx`.
- Seeded default `Page` records for static info pages without overwriting existing admin data:
  - FAQ
  - Shipping
  - Returns
  - Privacy
  - Terms
  - Reviews
  - Contact
- Converted these static pages to read admin-managed `Page` title, SEO, short description, hero copy, and freestyle `contentHtml`:
  - `/faq`
  - `/shipping`
  - `/returns`
  - `/privacy`
  - `/terms`
  - `/reviews`
  - `/contact`
- Contact page still uses the central Contact settings for actual phone, WhatsApp, email, address, and business hours.
- Reviews page still uses approved product reviews from the database, while page heading/intro/optional content is admin-managed.
- About page already used the advanced About admin model and has generic fallback metadata.
- Old water-bottle-specific fallback text was removed from the touched static info pages.

### Pages

- About
- FAQ
- Contact page content
- Shipping
- Returns
- Privacy Policy
- Terms & Conditions
- Reviews page content

### Tasks

- [x] Each static page should read from admin `Page` content.
- [x] Create default content in database if missing.
- [x] Admin can edit title, SEO, and content.
- [x] Contact page still uses contact settings for actual details.

### Acceptance Criteria

- [x] Page copy can be changed from admin.
- [x] No source code edit needed for legal/info content.
- [x] SEO fields editable.

### Test

- Prisma migration applied locally.
- Prisma Client regenerated.
- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Edit each static info page in Admin > Pages.
  - Add freestyle `contentHtml`.
  - Check `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms`, `/reviews`, `/contact`, and `/about-us`.
  - Confirm Contact details still come from Admin > Contact.
  - Confirm Reviews still show approved database reviews.

---

## Step 14: Dynamic Shop, Category, And Product Template Content - Completed

### Goal

Catalog pages ki headings, helper content, SEO, trust sections admin se control karna.

### Status

Completed on 2026-06-13.

### Implementation Notes

- Added `SiteSettings.catalogSettings` JSON field with a Prisma migration.
- Added `src/lib/catalogSettings.ts` for typed catalog template defaults, parsing, serialization, list helpers, item helpers, and `{{token}}` rendering.
- Settings Hub > Shopping / Store now includes a focused Catalog Template Content area for:
  - Shop fallback title/subtitle/rich HTML
  - Category eyebrow, fallback intro, badges, search placeholder, pagination tip, FAQ intro, help card copy, and sidebar trust items
  - Subcategory fallback intro, fallback rich HTML, and FAQ intro
  - Product brand fallback, fallback description, gallery badges, gallery trust items, price label, shipping note, size helper, fine print, tab labels, reviews copy, shipping/returns HTML, product FAQ copy, and related products copy
- `/shop` now uses catalog settings for fallback page title, subtitle, and rich content while preserving existing admin `Page` overrides.
- `/categories` was converted to a generic, admin-aware page:
  - reads optional `Page` record with slug `categories`
  - supports admin title/SEO/content
  - uses catalog settings for fallback hero/trust/help/search copy
- `/categories/[slug]` now uses catalog settings for category template fallback text, badges, search placeholder, pagination tip, subcategory section copy, FAQ intro, help card copy, and sidebar trust items.
- `/categories/[slug]/[sub]` now uses catalog settings for fallback intro, rich content, and FAQ intro.
- `/product/[slug]` and product buy box now use catalog settings for product template copy, gallery badges/trust, shipping note, size helper, fine print, tab labels/content, product FAQ heading/intro, and related products heading/subtitle/button.
- Product shipping note now uses the existing Store Settings default shipping fee instead of a hardcoded product-page amount.
- Existing product data, category data, reviews, add-to-cart, buy-now, wishlist, Meta Pixel view content, and Google view item events were preserved.
- Removed old water-bottle/static niche fallback copy from the touched catalog templates.

### Tasks

Shop:

- [x] Dynamic hero/title/description.
- [x] Dynamic empty state remains handled by existing shop client/global copy patterns.
- [x] Dynamic filter/sort labels partially covered through reusable template/search copy; deeper filter label work can be refined later if needed.

Category:

- [x] Category hero/intro/SEO content.
- [x] Optional bottom SEO text from category rich editor with catalog fallback.

Product:

- [x] Dynamic product page template labels.
- [x] Shipping/return snippets from catalog settings and shipping fee from store settings.
- [x] Related products heading from catalog settings.
- [x] FAQ heading from catalog settings.

### Files/Areas

- [x] `src/app/shop/`
- [x] `src/app/categories/`
- [x] `src/app/product/`
- Category/Product admin forms
- [x] Page builder sections supported on `/categories` and already supported on `/shop`

### Acceptance Criteria

- [x] Shop/category/product template not niche-hardcoded.
- [x] Product data still comes from products.
- [x] SEO remains intact.

### Test

- Prisma migration applied locally.
- Prisma Client regenerated.
- Lint pass with existing warnings only.
- Build pass.
- Manual browser checks recommended before deploy:
  - Settings > Shopping / Store > Catalog Template Content save.
  - Check `/shop`, `/categories`, `/categories/[slug]`, `/categories/[slug]/[sub]`, and `/product/[slug]`.
  - Confirm add-to-cart/buy-now still work.
  - Confirm product view tracking events still fire.

---

## Step 15: Blog And Content Hub Upgrade - Completed

### Goal

Pages aur blogs ko professional content management system jaisa banana.

### Status

Completed on 2026-06-17.

### Implementation Notes

- Added blog content hub fields to the database:
  - `Blog.category`
  - `Blog.tags`
  - `Blog.authorId`
  - `BlogAuthor.posts` relation
- Added a migration that also creates a default admin-managed `Page` record for `/blog`.
- Added shared blog content helpers for tag parsing/serialization and reading-time calculation.
- Admin blog API now supports category, tags, author assignment, author details, FAQ counts, and related product counts.
- Admin blog list was upgraded with:
  - summary cards
  - category filter
  - search across title, slug, category, and tags
  - visible author, category, tags, SEO status, related product count, and FAQ count
- Blog create/edit screens now include:
  - author selector
  - category field
  - tags field
  - SEO preview using the real slug/meta data
  - existing related products and FAQ editors preserved
- Blog SEO data now persists through the database instead of browser local storage.
- Public `/blog` now reads admin-managed blog page content/SEO from `Page` slug `blog`.
- Public `/blog` now supports category and tag filtering while keeping pagination and schema output.
- Public blog cards now show parsed tags and reading-time metadata.
- Public `/blog/[slug]` now uses assigned blog author when available, falls back safely, shows category/tags, and keeps related products/FAQs.
- Public `/blog/author/[slug]` now shows posts linked to that author through `authorId`.
- Existing blog product linking and FAQ management were preserved.

### Tasks

- [x] Improve blog list UI.
- [x] Add category/tag support.
- [x] Improve author management with per-post author assignment.
- [x] Add SEO preview.
- [x] Add draft/publish clarity through list stats/status and existing publish controls.
- [x] Preserve related products UI.
- [x] Preserve blog FAQ management and show FAQ count in list.
- [x] Link Blog and Pages under Content group was already covered by admin sidebar cleanup.

### Files/Areas

- `src/app/admin/(panel)/blog/`
- `src/app/blog/`
- Blog APIs/models

### Acceptance Criteria

- [x] Blog management clean and understandable ho.
- [x] Blog posts SEO-friendly hon.
- [x] Admin can publish/unpublish easily.
- [x] Category, tags, author, SEO, FAQs, and related products are manageable from admin blog screens.
- [x] Public blog listing and article pages remain dynamic and reusable for other ecommerce niches.

### Test

- Prisma migration applied locally with `npx prisma migrate deploy`.
- Prisma Client regenerated with `npx prisma generate`.
- `npm run lint` pass with existing warnings only.
- `npm run build` pass.
- Manual browser checks recommended before deploy:
  - Create/edit blog post.
  - Assign author, category, and tags.
  - Add SEO, FAQ, and related products.
  - Check `/blog`, `/blog?tag=...`, `/blog?category=...`, `/blog/[slug]`, and `/blog/author/[slug]`.
  - Confirm publish/unpublish behavior.

---

## Step 16: Tracking And Integrations Manager - Completed

### Goal

Meta Pixel, Google Tag, Clarity, custom code ko ek professional admin manager mein lana.

### Status

Completed on 2026-06-17.

### Implementation Notes

- Added explicit enable/disable toggles for tracking and script placements:
  - Meta Pixel
  - Google Tag Manager
  - Microsoft Clarity
  - Custom Head Scripts
  - Custom Body Start Scripts
  - Custom Body End Scripts
- Added shared tracking helper utilities in `src/lib/trackingSettings.ts` for:
  - Meta Pixel ID splitting/deduping/validation
  - GTM ID validation
  - Microsoft Clarity ID validation
  - custom script duplicate-warning detection
- Updated public layout script injection to only render enabled and valid tracking IDs.
- Existing Meta Pixel and Google ecommerce event helpers were preserved.
- Settings Hub > Tracking & Integrations now shows:
  - integration status cards
  - field-level validation messages
  - enable/disable toggles
  - Facebook and Google verification token fields
  - ecommerce event checklist for View Content, Add to Cart, Begin Checkout, and Purchase
- Settings Hub > Custom Code now shows:
  - placement-specific enable toggles
  - duplicate snippet warnings for GTM, Meta Pixel, and Clarity snippets
  - separated head/body-start/body-end script areas
- Existing tracking IDs remain enabled by default after migration, so live tracking behavior is preserved.

### Tasks

- [x] Create Integrations/Tracking section.
- Group settings:
  - Meta Pixel
  - Google Tag Manager
  - Google verification
  - Facebook verification
  - Microsoft Clarity
  - Custom Head Scripts
  - Body Start Scripts
  - Body End Scripts
- [x] Add enable/disable toggles.
- [x] Add validation for common ID formats.
- [x] Add event checklist display:
  - View Content
  - Add to Cart
  - Begin Checkout
  - Purchase
- [x] Prevent duplicate script injection through warnings and central ID-based script injection.

### Files/Areas

- `src/app/admin/(panel)/settings/page.tsx` or new settings subpage
- `src/components/GoogleTagManager.tsx`
- `src/components/MetaPixel.tsx`
- `src/components/SiteCustomScripts.tsx`
- tracking utilities in `src/lib/`

### Acceptance Criteria

- [x] Existing Meta and Google event functions remain.
- [x] Script placement remains correct.
- [x] Admin can manage tracking in one place.
- [x] Invalid IDs are not injected into the public layout.
- [x] Custom script placements can be disabled without deleting saved snippets.

### Test

- Prisma migration applied locally with `npx prisma migrate deploy`.
- Prisma Client regenerated with `npx prisma generate`.
- `npm run lint` pass with existing warnings only.
- `npm run build` pass.
- Manual browser checks recommended before deploy:
  - Add/remove Meta Pixel ID.
  - Add GTM ID.
  - Toggle Meta Pixel/GTM/Clarity on and off.
  - Confirm public layout source/script injection.
  - Test View Content, Add to Cart, Begin Checkout, and Purchase events with browser tools.
  - Add a duplicate GTM/Pixel snippet in Custom Code and confirm warning appears.

---

## Step 17: Design And Theme Settings - Completed

### Goal

Client branding ko admin se control karna.

### Status

Completed on 2026-06-17.

### Implementation Notes

- Added `SiteSettings.themeSettings` JSON storage with a Prisma migration.
- Added shared theme utilities in `src/lib/themeSettings.ts` for:
  - default theme tokens
  - safe parsing/serialization
  - CSS variable generation
  - hex color validation
  - radius clamping
  - contrast warnings
- Settings Hub now has a dedicated `Design & Theme` tab with:
  - primary color
  - primary hover color
  - secondary color
  - accent color
  - background color
  - surface color
  - text color
  - muted text color
  - border color
  - button radius
  - card radius
  - font style choice
  - live theme preview
  - reset-to-defaults action
  - contrast warnings
- Public root layout now reads theme settings and injects CSS variables into the body.
- Global CSS now exposes reusable theme utilities:
  - `btn-primary`
  - `btn-secondary`
  - `theme-card`
  - `theme-primary-action`
  - `theme-header`
  - `theme-footer-cta`
- Core storefront surfaces now pick up theme tokens:
  - global body/background/text
  - headings
  - buttons
  - header
  - footer newsletter CTA
  - product cards
  - cart drawer
  - checkout cards, total panel, and place-order buttons
- Admin remains visually stable because admin UI still mostly uses its neutral design system.

### Tasks

- [x] Add theme settings:
  - Primary color
  - Primary hover color
  - Secondary color
  - Accent color
  - Background color
  - Surface color
  - Text color
  - Muted text color
  - Border color
  - Button radius
  - Card radius
  - Font choice optional
- [x] Generate CSS variables from settings.
- [x] Apply variables to core components gradually:
  - Buttons
  - Header
  - Footer
  - Cards
  - Checkout highlights
  - Admin preview

### Files/Areas

- `src/app/layout.tsx`
- global CSS
- settings API/admin
- shared UI components

### Acceptance Criteria

- [x] Brand color can be changed from admin.
- [x] Core frontend reflects theme.
- [x] Admin remains usable.
- [x] No unreadable color combinations by default; low-contrast combinations show admin warnings.

### Test

- Prisma migration applied locally with `npx prisma migrate deploy`.
- Prisma Client regenerated with `npx prisma generate`.
- `npm run lint` pass with existing warnings only.
- `npm run build` pass.
- Manual browser checks recommended before deploy:
  - Settings > Design & Theme save.
  - Change primary/accent/background colors.
  - Change button/card radius.
  - Check header, footer, product cards, cart drawer, cart page, and checkout.
  - Confirm admin screens remain readable.

---

## Step 18: Reusable Blocks Library - Completed

### Goal

Repeated content ko once-manage, many-places-use system banana.

### Tasks

Create reusable block management for:

- [x] Trust badges
- [x] COD message
- [x] Delivery message
- [x] Return policy snippet
- [x] WhatsApp help card
- [x] Promo banner
- [x] Product shipping info
- [x] Checkout reassurance section

### Files/Areas

- [x] New admin area under Content: `/admin/reusable-blocks`
- [x] New Prisma model/table: `ReusableBlock`
- [x] Admin/public APIs for reusable blocks
- [x] Page builder integration with `reusableBlock` section type
- [x] Cart and checkout integrations with placement-based blocks

### Acceptance Criteria

- [x] A reusable block can be edited once and reflected in multiple places.
- [x] Page builder can use reusable blocks by slug.
- [x] Cart/checkout can load selected enabled blocks by placement.

### Test

- Prisma migration applied locally with `npx prisma migrate deploy`.
- Prisma Client regenerated with `npx prisma generate`.
- `npm run lint` pass with existing warnings only.
- `npm run build` pass.
- Manual browser checks recommended before deploy:
  - Create/edit/delete a block from `/admin/reusable-blocks`.
  - Confirm reusable blocks still appear through placement-based integrations such as checkout and cart.
  - Confirm checkout placement blocks appear on `/checkout`.
  - Confirm cart placement blocks appear on `/cart`.

---

## Step 19: New Client Setup / White-Label Onboarding - Completed

### Goal

Software ko dusre client ko dene ke liye setup process easy banana.

### Tasks

- [x] Add admin onboarding checklist:
  - [x] Upload logo
  - [x] Add contact details
  - [x] Set colors
  - [x] Configure menus
  - [x] Configure footer
  - [x] Configure checkout
  - [x] Add tracking IDs
  - [x] Add first products
- [x] Add generic seed content action for missing starter content.
- [x] Add starter template apply action that does not overwrite configured fields.
- [ ] Add full reset/apply-template presets later.
- [ ] Add export/import settings later.

### Acceptance Criteria

- [x] New client can configure store without developer help for basic launch.
- [x] No old Sahoolat/niche-specific content is added by onboarding seed content.
- [x] Admin clearly shows remaining setup tasks in `/admin/onboarding`.
- [x] Dashboard shows launch readiness progress.

### Test

- `npm run lint` pass with existing warnings only.
- `npm run build` pass.
- Manual browser checks recommended before deploy:
  - Open `/admin/onboarding`.
  - Confirm launch readiness checklist loads.
  - Click "Apply starter template" on a test database.
  - Confirm missing generic pages/category/reusable blocks/settings are added.
  - Confirm existing configured fields are not overwritten.

---

## Step 20: QA, Performance, Security, And Documentation - Completed

### Goal

Final platform ko production-grade banana.

### Tasks

- [x] Run full build.
- [x] Check TypeScript errors.
- [x] Smoke check major storefront routes.
- [x] Check admin permission redirect.
- [x] Improve script injection safety for custom code snippets.
- [x] Check SEO metadata routes through robots/sitemap smoke test.
- [x] Document image loading checks.
- [x] Document order placement checks.
- [x] Document tracking event checks.
- [x] Write admin user guide.
- [x] Write developer notes for future clients.
- [x] Write production QA checklist.

### Acceptance Criteria

- [x] Build pass.
- [x] Core ecommerce route smoke test pass.
- [x] Admin access control smoke test pass.
- [x] No tracking regression expected; dedicated Meta Pixel/GTM/Clarity fields remain unchanged.
- [x] Documentation available.

### Test

- `npm run lint` pass with existing warnings only.
- `npm run build` pass.
- Production server smoke test with `next start`:
  - `/` => 200
  - `/shop` => 200
  - `/cart` => 200 + `X-Robots-Tag: noindex, nofollow`
  - `/checkout` => 200 + `X-Robots-Tag: noindex, nofollow`
  - `/robots.txt` => 200
  - `/sitemap.xml` => 200
  - `/api/site-settings` => 200 + `X-Robots-Tag: noindex, nofollow`
  - `/api/reusable-blocks?placement=checkout` => 200 + `X-Robots-Tag: noindex, nofollow`
  - `/admin/dashboard` unauthenticated => 307 redirect to `/admin/login`
- Documentation added:
  - `docs/production-qa-checklist.md`
  - `docs/admin-user-guide.md`
  - `docs/developer-handoff-notes.md`
- Manual browser QA checklist:
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

---

## Recommended Sprint Breakdown

### Sprint 1: Admin Foundation

- Step 1: Admin sidebar grouping
- Step 2: Shared admin UI components
- Step 3: Settings hub cleanup

### Sprint 2: Global Settings And Branding

- Step 4: Generic fallback cleanup
- Step 5: Contact settings everywhere
- Step 6: Dynamic header settings and menus
- Step 7: Dynamic footer settings and menus

### Sprint 3: Core Copy And Checkout

- Step 8: Global copy settings
- Step 9: Checkout settings
- Step 10: Dynamic cart page and drawer copy

### Sprint 4: Page Builder MVP

- Step 11: Page builder foundation
- Step 12: Convert home page
- Step 13: Convert static info pages

### Sprint 5: Catalog And Blog Dynamic Content

- Step 14: Dynamic shop/category/product template content
- Step 15: Blog and content hub upgrade

### Sprint 6: Integrations, Theme, White-Label

- Step 16: Tracking and integrations manager
- Step 17: Design and theme settings
- Step 18: Reusable blocks library
- Step 19: New client setup / white-label onboarding

### Sprint 7: Final Hardening

- Step 20: QA, performance, security, and documentation

---

## Best First Step To Implement

Start with:

1. Admin sidebar grouping
2. Shared admin UI components
3. Settings hub cleanup

Reason: Yeh changes low-risk hain, admin ko immediately professional banate hain, aur baad ke dynamic content ka foundation create karte hain.
