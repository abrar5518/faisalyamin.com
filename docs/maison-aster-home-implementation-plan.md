# FaisalYamin.com Maison Aster Home Implementation Plan

## Objective

Rebuild the FaisalYamin.com home page to match the supplied `Maison Aster` HTML design as closely as possible while keeping every business-facing part manageable from the existing admin panel.

The supplied HTML is the visual source of truth. Its final effective CSS and JavaScript state—not earlier overridden experiments in the same file—defines the target appearance and interactions.

Implementation must preserve the production stack:

- Next.js App Router and React
- Prisma with MySQL
- Existing authentication, cart, wishlist, uploads, product, category, review, and checkout behavior
- PM2 and Nginx deployment
- `faisalyamin.com` GitHub repository as the only normal pull/push remote

## Delivery Rules

1. Work is delivered one milestone at a time.
2. Each milestone includes its database, API, admin, frontend, responsive, and validation work where applicable.
3. A milestone is not complete until type-check/build and relevant runtime checks pass.
4. Each completed milestone is committed and pushed before the next visual milestone begins.
5. Uploaded media is stored through the existing persistent `/uploads/` system. Base64 media is not stored in database rows.
6. Admin content must remain usable even when a section has no records.
7. Inactive or deleted linked products must not break the home page.
8. Existing checkout, account, cart, wishlist, SEO, and product-page functionality must remain working.

## Target Home Page Order

The implementation will follow the supplied design in this order:

1. Existing global announcement/header, restyled only when its milestone is reached
2. Hero slider
3. Service/trust bar
4. Featured category collection cards
5. First product section using the new product card
6. Editorial campaign block
7. Second/tabbed product section using the same product card system
8. Curated fan-style product showcase
9. Remaining editorial, social-proof, reviews, newsletter, and footer content in supplied-design order

The final ordering will be configurable where useful, but the supplied layout is the default.

---

## Milestone 1 — Unlimited Hero Slider

**Status:** Completed on 2026-08-22. Migration: `20260822010000_add_home_hero_slides`. Validation: Prisma schema validation, migration deployment, Prisma Client generation, TypeScript check, production build, authenticated admin GET/PUT round-trip, four-slide unlimited-array test with restoration to three reference slides, public HTTPS render, and persistent hero asset HTTP check.

### Visual target

- Full-width editorial slider inside the page gutters
- Split copy/media composition on desktop
- Cutout/model media treatment and supplied soft editorial backgrounds
- Eyebrow, large serif title, supporting copy, primary and secondary actions
- Slide index, dots, previous/next controls, and automatic rotation
- Smooth cross-fade/entrance animation
- Mobile full-bleed media with readable gradient copy overlay
- Keyboard-operable controls and reduced-motion support

### Prisma

Add `HomeHeroSlide` related to the home `Page`:

- `id`
- `pageId`
- `eyebrow`
- `title`
- `description`
- `primaryLabel`
- `primaryHref`
- `secondaryLabel`
- `secondaryHref`
- `desktopImage`
- `mobileImage`
- `imageAlt`
- `backgroundColor`
- `accentColor`
- `badgeText`
- `isEnabled`
- `sortOrder`
- timestamps

Add slider-level configuration to `sectionsJson`:

- `heroSliderEnabled`
- `heroSliderAutoPlay`
- `heroSliderIntervalMs`
- `heroSliderShowArrows`
- `heroSliderShowDots`

There is no fixed slide limit. Admin may add as many slides as required.

### Admin

Add a Hero Slider panel to `/admin/home`:

- Add slide
- Remove slide
- Move up/down and deterministic ordering
- Enable/disable individual slide
- All copy and CTA fields
- Desktop and optional mobile image upload
- Image alt text
- Background and accent color inputs
- Slider-level autoplay, interval, arrow, and dot controls
- Client-side validation and clear save feedback

### API

Extend `/api/admin/home`:

- GET includes ordered hero slides
- PUT validates slider settings and an unlimited slide array
- Use a Prisma transaction
- Replace/reconcile child records safely
- Normalize blank optional fields
- Validate internal paths and permitted HTTP(S) links

The public home remains server-rendered; a separate public home API is not required.

### Frontend

Create a focused client component such as `HomeHeroSlider` and pass server-loaded slide data into it. Keep SEO-relevant slide copy in rendered HTML. Images use the existing image normalization and uploads infrastructure.

### Acceptance criteria

- Admin can create, save, edit, reorder, disable, and delete more than three slides
- Refresh preserves exact ordering and values
- Desktop and mobile match the supplied final hero composition
- Autoplay pauses during interaction/hover/focus where appropriate
- Arrows, dots, touch/swipe, and keyboard controls work
- No hydration errors
- Empty state falls back safely without copied Sahoolat data
- Production build passes

---

## Milestone 2 — Shared Product Card Redesign

**Status:** Completed on 2026-08-22. Added the reusable `maison` card variant, shared server/API product-card mapper, ordered primary/hover images, badges, wishlist action, safe quick-add/choose-options behavior, category/short-copy support, compare-at pricing, and variant color swatches. No database migration was required because the existing product, image, variant, cart, and wishlist structures cover the supplied card design. Validation: TypeScript check, production build, semantic interactive-element review, and public product API backward-compatible additive card payload.

### Visual target

- Tall editorial image ratio
- Primary image and optional hover image
- Compact badge in upper-left
- Wishlist control in upper-right
- Quick-add control revealed on desktop and visible/usable on touch devices
- Product name and price on one visual row
- Compare-at price and supporting product/category copy
- Variant color swatches
- Minimal borders and typography matching the supplied HTML

### Existing data to reuse

- Product name, slug, brand, price, compare-at, badge
- Rating and review count
- Short description
- Product images and their order
- JSON variants including labels/color codes/images
- Featured/sale/active flags
- Existing cart and wishlist systems

### Backend/API work

- Introduce one shared product-card mapper so server queries and APIs return consistent card data
- Ensure public product responses include ordered images and normalized active variants
- No schema change unless implementation reveals a genuine missing business field
- Quick add sends simple products directly to cart
- Products requiring size/variant selection open a compact selector or route to their product page

### Admin work

Existing product fields cover the design. Improve labels/help text only if editors cannot reliably provide hover image, badge, short copy, or color swatches.

### Acceptance criteria

- Same component works in all home product sections
- Wishlist and cart behavior remains functional
- Missing second images/variants render cleanly
- Cards match supplied desktop and mobile layouts

---

## Milestone 3 — First Product Section

**Status:** Completed on 2026-08-22. The supplied `Trending now` composition now uses the shared Maison cards, four-column desktop/two-column mobile layout, editorial heading/tabs/view-all styling, and admin-managed title, subtitle, tabs, source, limit, link, and manually ordered product selection. Empty stores use four design-reference cards; real active products replace them according to the configured source. Validation: TypeScript check, production build, authenticated admin GET/PUT round-trip, four-card public render, HTTPS 200, and PM2 online check.

- Supplied section heading, subtitle, view-all action, spacing, and four-column desktop grid
- Uses new shared product cards
- Admin controls heading/subtitle/link, enabled state, source (`featured`, `sale`, `new`, or manually selected), limit, and ordering
- Prefer manual selected products with an automatic-source fallback
- Mobile uses two columns as in the supplied design

## Milestone 4 — Category Collection Section

**Status:** Completed on 2026-08-22. Added the supplied asymmetric three-card editorial collection layout, desktop 1.25/1/1 proportions, mobile horizontal scroll-snap, image overlays and typography, real category links, three-card design-reference fallback, and admin featured/manual category selection with ordering. Validation: TypeScript check, production build, admin settings response, public HTTPS 200, and three rendered category cards.

- Asymmetric three-card editorial category layout
- Uses real categories, images, names, and links
- Admin selects/reorders featured categories and edits section heading/link
- Mobile becomes horizontal snap or stacked layout according to the supplied final design

## Milestone 5 — Second/Tabbed Product Section

- Supplied tab typography and layout
- Admin creates tabs and assigns source/filter/manual products per tab
- Tab changes occur client-side without losing accessibility
- Uses the same shared product card component

## Milestone 6 — Fan Product Showcase

### Prisma

Add `HomeProductShowcase` and `HomeProductShowcaseItem`:

- Section enabled state, eyebrow, title, subtitle, visual theme
- Item relation to Product
- Optional editorial label override
- Enabled state and sort order
- Default active/center item

### Admin/API

- Search/select real products
- Add/remove/reorder items
- Recommended five items but safely supports fewer/more
- Never duplicate product name, price, image, or slug into showcase rows
- Hide inactive/missing products safely

### Frontend

- Overlapping rotated fan cards on desktop
- Hover/focus brings a card forward
- Horizontal touch scroll with snap on mobile
- Real product name, image, price, label, and URL

## Milestone 7 — Remaining Supplied Sections

Implement one at a time in visual order:

- Service/trust bar
- Editorial campaign split block
- Any remaining style/editorial discovery block retained by the final supplied design
- Social proof/reviews
- Newsletter/footer alignment

Each section receives admin controls only for content editors actually need to change. Simple layout constants remain in code rather than creating unnecessary database fields.

### 2026-08-22 implementation update

- Curated fan showcase implemented from the supplied reference, including five-card desktop fan geometry, hover/focus activation, and mobile touch scroll-snap.
- Showcase headings and product source are managed from Home admin. Product name, price, image, label, and URL continue to come from the existing Product API/model; no duplicate product data was introduced.
- Editorial journal split block implemented from the supplied reference. Eyebrow, heading, copy, image/alt text, button label/link, and visibility are managed from Home admin.
- Previous Sale/Deals carousel and Trending product-grid output were removed from the public home page as requested. The Maison category collection remains.
- No Prisma migration was required: the ordered showcase selection reuses the existing `featuredProductIds` section configuration, while section presentation fields use the existing validated `sectionsJson` design.
- Validation: TypeScript and the full Next.js production build pass.

---

## Data and API Design Principles

- Normalize relational content where ordering and references matter (slides and selected products).
- Use `sectionsJson` for small section-level presentation settings.
- Do not store entire HTML fragments in the database for these structured sections.
- Do not duplicate product truth into home-page records.
- Use Zod on all admin writes.
- Use Prisma transactions for page plus child-record updates.
- Return stable, explicit admin response shapes.
- Continue protecting admin endpoints with existing admin authentication.

## Media Plan

- Import any usable supplied reference asset into persistent uploads or repository assets when licensing/source allows.
- Admin replacements go through existing upload APIs.
- Store paths/URLs and alt text, not Base64 blobs.
- Support distinct desktop/mobile hero media.
- Use `next/image` with responsive sizes and priority only for the first visible hero image.

## Quality Checklist for Every Milestone

- Prisma migration is reviewed and applied
- Prisma Client generated
- Admin GET/PUT tested
- Empty, one-item, normal, and over-limit states tested
- Desktop, tablet, and mobile checked
- Keyboard/focus behavior checked
- Reduced-motion behavior checked for animated sections
- Image fallback and alt text checked
- `npm run build` passes
- PM2 restart succeeds
- Public HTTPS route and APIs return expected results
- Commit pushed to `origin/main`

## Rollout Sequence

1. Unlimited Hero Slider
2. Shared Product Card
3. First Product Section
4. Category Collection Section
5. Second/Tabbed Product Section
6. Fan Product Showcase
7. Remaining sections, one by one
8. Whole-page polish and regression QA

This document must be updated as each milestone is completed, including the commit hash, migration name, validation performed, and any deliberate visual deviation from the supplied reference.
