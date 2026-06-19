# Reusable Ecommerce Platform Improvement Plan

## Objective

Sahoolat.pk ko ek reusable, white-label ecommerce platform banana hai jise future clients, different products, different niches, different branding, aur different business rules ke saath easily customize kiya ja sake.

Final target yeh hai ke website ki visible cheezen admin se control hon:

- Logo, colors, typography, favicon, brand name
- Header, footer, navigation menus, announcement bars
- Home page, shop page, category pages, product page content sections
- Static pages, legal pages, FAQ, reviews, contact, shipping, returns
- Blog posts, blog categories, authors, SEO, FAQs
- Checkout copy, payment methods, shipping rules, city list, support text
- Contact details, WhatsApp links, email, address, social links
- Tracking codes, Meta Pixel, Google Tag Manager, custom scripts
- Reusable content blocks, banners, offers, trust badges, testimonials
- Client-specific settings without touching source code

This document is the planning file only. Implementation should be done phase-by-phase after approval.

---

## Current State Analysis

### 1. Frontend Content Is Still Too Static

Many public pages and components still contain hardcoded headings, labels, fallback text, and business-specific copy. Examples found during code review:

- Header navigation labels are hardcoded in `SiteHeader`.
- Footer sections, newsletter copy, quick links, payment/support text, and fallback footer text are hardcoded in `SiteFooter`.
- Home page components still contain niche-specific content such as water bottle headings.
- Checkout has optimized UX, but copy, trust badges, city list, COD text, and shipping behavior still need admin-level control.
- Static public pages such as FAQ, shipping, returns, privacy, terms, reviews, contact, cart empty states, and account/auth copy need to become CMS-driven or setting-driven.
- Existing fallback data still contains mixed old values such as `LuxStore`, luxury watches, accessories, and water bottle content. This makes the platform look less reusable.

### 2. Admin Panel Exists But Needs Better Information Architecture

The admin panel currently has useful modules:

- Dashboard
- Products
- Reviews
- Shop
- Categories
- Subcategories
- Orders
- Coupons
- Loyalty
- Customers
- Subscriptions
- Contact
- Pages
- Blog
- APIs
- Settings

However, the structure is flat and not arranged around real admin workflows. A non-technical client will find it harder to understand where to update content, where to update brand settings, where to update footer text, where to add tracking scripts, and where to manage all pages.

### 3. Pages Admin Is Limited And Page-Specific

The current `Page` model and admin pages support some editable fields, but the implementation is not generic enough.

Current issues:

- `DEFAULT_PAGES` only covers limited pages such as Home, Deals, and About.
- Page editing form has special handling for pages like `home` and `about-us`.
- About page has separate specific models and logic.
- Content sections are not managed as reusable page blocks.
- It is hard to create a completely new page layout from admin without code changes.
- Static pages like FAQ, Shipping, Returns, Terms, Privacy, Reviews, Contact, Cart, Checkout content, and Product template copy are not unified under one content management experience.

### 4. Settings Are Powerful But Mixed Together

`SiteSettings` and `StoreSettings` already exist and cover important things:

- Logo
- Site icon
- Footer text
- Meta Pixel IDs
- Google Tag Manager ID
- Google / Facebook verification
- Microsoft Clarity
- Custom head/body scripts
- Shipping threshold
- Payment method toggles
- SEO defaults
- Admin password/security settings

But the admin UI currently mixes branding, store, SEO, tracking, custom scripts, checkout, and security into long settings screens. For a reusable client-ready product, settings need to be grouped into clean sections with clear labels, previews, validation, and help text.

### 5. Contact Details Are Separate But Not Fully Integrated Everywhere

There is a separate contact management page with phone, WhatsApp, email, address, hours, and notes. This is good, but those values should power every frontend location:

- Header support links
- Footer contact block
- WhatsApp floating button
- Contact page
- Checkout help card
- Order success page
- Email templates / WhatsApp templates later

### 6. Tracking And Custom Scripts Need A Unified Integrations Manager

Tracking is already present and important:

- Meta Pixel
- Google Tag Manager
- Google Analytics style ecommerce events
- Purchase / checkout / add-to-cart events
- Custom head/body scripts

These should remain intact, but admin should provide a cleaner tracking manager:

- Enable/disable integrations
- Add multiple Meta Pixel IDs
- Add GTM ID
- Add Google Ads conversion IDs later
- Add TikTok Pixel later
- Add custom scripts in controlled locations
- Validate script placement
- Show which ecommerce events are currently firing
- Keep standard events consistent across cart, checkout, and order success

### 7. Product Catalog Is Good But Needs More Template Control

Products, categories, subcategories, variants, images, SEO, FAQs, reviews, coupons, and orders already exist. The improvement is not to rewrite the catalog. The improvement is to make the surrounding presentation dynamic:

- Product page section order
- Product trust badges
- Shipping/returns copy on product pages
- Category hero copy
- Category SEO content
- Product page upsell/cross-sell sections
- Empty state copy
- Product card badges and labels
- Shop filters and sorting labels

### 8. Checkout Is Now Better But Should Become Configurable

The checkout redesign is conversion-focused for Pakistan ecommerce and COD. Next step is to make the checkout reusable:

- Payment methods from admin
- COD label and helper text from admin
- Shipping fee rules from admin
- City list from admin
- Checkout trust badges from admin
- WhatsApp help button from contact settings
- Checkout logo from site settings
- Order success copy from admin
- Optional fields controlled from admin

### 9. Admin UX Needs A Design System

Many admin screens work functionally, but the experience needs to become more professional and consistent:

- Better sidebar grouping
- Cleaner page headers
- Consistent cards/forms/tabs
- Better empty states
- Better save buttons
- Preview links
- Status badges
- Draft/published states
- Search/filter/sort tables
- Bulk actions where needed
- Clear separation between content, store, orders, and settings

### 10. White-Label Readiness Is Missing

The website should not contain product/niche-specific assumptions in code. For white-label readiness:

- No hardcoded brand names
- No hardcoded niche copy
- No hardcoded footer links
- No hardcoded city/payment/support copy where admin should control it
- No hardcoded legal page content
- No hardcoded home page sections
- No hardcoded navigation menus
- Clean import/export or seed system for new clients
- One clear onboarding flow for a new store/client

---

## Target Platform Architecture

### Core Principle

Source code should define components, layouts, validation, and business logic.

Admin panel should define content, branding, settings, pages, menus, tracking, and client-specific configuration.

### Recommended Admin Structure

#### Dashboard

Purpose: Business overview.

Should include:

- Today orders
- Revenue
- Pending orders
- Conversion metrics
- Low stock products
- Recent activity
- Quick links to products, orders, pages, settings

#### Content

Purpose: Manage every website content page and reusable content block.

Subsections:

- Pages
- Page Builder
- Blog Posts
- Blog Categories
- Authors
- Menus
- Reusable Blocks
- FAQ Groups
- Testimonials
- Media Library

#### Store

Purpose: Manage ecommerce catalog.

Subsections:

- Products
- Categories
- Subcategories
- Collections
- Reviews
- Inventory / Variants
- Product Labels / Badges

#### Orders

Purpose: Manage customers and sales.

Subsections:

- Orders
- Customers
- Coupons
- Loyalty
- Subscriptions
- Abandoned Checkout later

#### Design

Purpose: Control visual identity without code.

Subsections:

- Brand Identity
- Logo & Icons
- Colors
- Typography
- Buttons
- Product Cards
- Header Layout
- Footer Layout
- Theme Preview

#### Settings

Purpose: Control business, technical, and integration settings.

Subsections:

- Store Info
- Contact & Support
- Shipping
- Payments
- Checkout
- SEO
- Tracking & Pixels
- Custom Code
- Admin Users / Security
- Import / Export

---

## Proposed Dynamic Content System

### 1. Pages

Every public page should have a database record.

Recommended fields:

- Title
- Slug
- Page type
- Status: draft / published
- SEO title
- SEO description
- Canonical URL
- Open Graph image
- Sections
- Custom CSS class optional
- Visibility rules optional
- Created/updated timestamps

Recommended page types:

- Home
- Shop
- Category
- Product template
- Blog index
- Blog post template
- Contact
- FAQ
- Reviews
- About
- Shipping
- Returns
- Privacy Policy
- Terms & Conditions
- Cart
- Checkout content
- Order Success
- Custom page

### 2. Page Sections

Instead of page-specific columns for every design, use reusable section blocks.

Recommended section types:

- Hero Banner
- Product Grid
- Category Grid
- Collection Carousel
- Sale / Deals Section
- Text Content
- Image + Text
- FAQ
- Testimonials
- Trust Badges
- Newsletter
- Contact Info
- Blog Grid
- HTML Block
- CTA Section
- Review Section
- Video Section later

Each section should have:

- Section type
- Sort order
- Enabled/disabled
- Content JSON
- Styling JSON
- Visibility rules
- Device settings: desktop/mobile visibility

### 3. Reusable Blocks

Reusable blocks should be managed once and used in multiple pages.

Examples:

- Trust badges
- COD message
- Delivery all Pakistan block
- WhatsApp support card
- Footer newsletter block
- Product page shipping info
- Return policy snippet
- Promo banner

### 4. Menus

Header and footer should be controlled by admin menus.

Recommended menu locations:

- Header primary
- Header mobile
- Footer column 1
- Footer column 2
- Footer support
- Footer legal
- Checkout minimal header optional

Menu item fields:

- Label
- URL or page reference
- Parent item
- Sort order
- Open in new tab
- Icon optional
- Enabled/disabled

### 5. Global Copy

Some repeated labels should be controlled centrally.

Examples:

- Add to cart
- Buy now
- View cart
- Checkout
- Continue shopping
- Search placeholder
- Free shipping message
- COD available message
- Empty cart message
- Order success message
- Product unavailable message

This makes localization and niche customization easier later.

---

## Proposed Settings System

### Brand Settings

Should control:

- Store name
- Public website URL
- Logo
- Dark logo optional
- Mobile logo optional
- Favicon/site icon
- Logo alt text
- Brand tagline
- Default social preview image

### Theme Settings

Should control:

- Primary color
- Secondary color
- Accent color
- Text color
- Background color
- Button radius
- Card radius
- Font family
- Product card style
- Header style
- Footer style

Implementation note: Start with CSS variables generated from settings. Avoid making every component manually read settings.

### Header Settings

Should control:

- Announcement bar enabled/disabled
- Announcement text
- Announcement link
- Logo position
- Search enabled/disabled
- Account icon enabled/disabled
- Cart icon enabled/disabled
- Support phone/WhatsApp visibility
- Sticky header enabled/disabled
- Header menu selection

### Footer Settings

Should control:

- Footer logo
- Footer description
- Footer copyright text
- Footer columns via menus
- Newsletter enabled/disabled
- Payment badges
- Delivery/trust strip
- Social links
- Contact info visibility

### Store Settings

Should control:

- Currency
- Currency symbol
- Price format
- Default shipping fee
- Free shipping threshold
- Tax settings later
- Inventory behavior
- Out-of-stock behavior
- Product reviews enabled/disabled

### Checkout Settings

Should control:

- Checkout style: COD-first / standard
- Phone required
- Email optional/required/hidden
- City dropdown values
- Address helper text
- Payment methods enabled
- COD title and helper text
- Checkout trust badges
- WhatsApp support text
- Order confirmation method
- Success page copy
- Expected delivery time text

### Contact & Support Settings

Should control:

- Phone number
- WhatsApp number
- WhatsApp default message
- Email
- Physical address
- Business hours
- Google Maps embed
- Social links
- Support cards

### SEO Settings

Should control:

- Default meta title
- Default meta description
- Default OG image
- Robots settings
- Sitemap behavior
- Schema organization data
- Social profiles
- Page-level SEO overrides

### Tracking & Custom Code Settings

Should control:

- Meta Pixel IDs
- Google Tag Manager ID
- Google Analytics ID if needed
- Google Ads conversion ID later
- Microsoft Clarity ID
- TikTok Pixel later
- Custom head scripts
- Custom body start scripts
- Custom body end scripts
- Event toggles and diagnostics

Important: Existing ecommerce events must remain:

- View content
- Add to cart
- Begin checkout
- Purchase
- Lead/contact events if used later

---

## Proposed Data Model Direction

The current Prisma schema already has many useful models. The goal should be to evolve it carefully, not rewrite everything at once.

### Recommended New Or Refactored Models

#### SiteConfig

Unified high-level configuration for one storefront.

Fields:

- id
- siteName
- siteUrl
- timezone
- currency
- locale
- isActive
- createdAt
- updatedAt

#### ThemeConfig

Controls visual theme.

Fields:

- id
- primaryColor
- secondaryColor
- accentColor
- textColor
- backgroundColor
- fontFamily
- borderRadius
- buttonStyle
- cardStyle
- customCss optional

#### NavigationMenu

Fields:

- id
- name
- location
- isActive

#### NavigationMenuItem

Fields:

- id
- menuId
- label
- href
- pageId optional
- parentId optional
- icon optional
- sortOrder
- isActive
- openInNewTab

#### Page

Existing `Page` can be evolved toward:

- id
- title
- slug
- type
- status
- seoTitle
- seoDescription
- ogImage
- canonicalUrl
- publishedAt
- createdAt
- updatedAt

#### PageSection

Fields:

- id
- pageId
- type
- title
- sortOrder
- isEnabled
- content JSON
- styles JSON
- settings JSON

#### ReusableBlock

Fields:

- id
- name
- type
- content JSON
- styles JSON
- isActive

#### GlobalCopy

Fields:

- id
- key
- value
- group
- description

#### IntegrationSetting

Fields:

- id
- provider
- isEnabled
- config JSON
- placement
- createdAt
- updatedAt

#### CheckoutSettings

Fields:

- id
- phoneRequired
- emailMode
- cityMode
- cities JSON
- codEnabled
- codTitle
- codDescription
- trustBadges JSON
- successPage JSON

#### SupportChannel

Fields:

- id
- type
- label
- value
- url
- isPrimary
- isActive
- sortOrder

### Multi-Client / White-Label Future

For now, single-store mode is fine. But model design should be future-ready:

- Add `siteId` or `storeId` to configurable models later.
- Keep code paths ready for per-store settings.
- Avoid global hardcoded assumptions.
- Use seed templates for new client setup.

---

## Frontend Improvement Plan

### 1. Dynamic Header

Make header read from:

- Brand settings
- Header settings
- Navigation menu
- Contact/support settings
- Store settings

Header should support:

- Dynamic logo
- Dynamic nav menu
- Dynamic search placeholder
- Dynamic support text
- Dynamic announcement bar
- Cart drawer remains global

### 2. Dynamic Footer

Make footer read from:

- Footer settings
- Footer menus
- Contact settings
- Social links
- Store settings
- Global copy

Footer should support:

- Editable text
- Editable columns
- Editable legal links
- Editable newsletter block
- Editable trust/payment badges

### 3. Dynamic Home Page

Move home sections into page builder:

- Hero
- Featured categories
- Featured products
- Deals
- Trust badges
- FAQ
- Testimonials
- Blog section

Admin should control section order, content, visibility, and selected products/categories.

### 4. Dynamic Shop And Category Pages

Admin should control:

- Shop hero title/subtitle
- Category page intro
- SEO content
- Product grid labels
- Empty state copy
- Filter labels
- Sort options display

### 5. Dynamic Product Page Template

Admin should control:

- Trust badges
- Shipping/return snippets
- Product details section labels
- FAQ section labels
- Related products heading
- Sticky add-to-cart behavior text
- Product page guarantees

### 6. Dynamic Cart Page And Cart Drawer

Admin should control:

- Empty cart message
- Continue shopping label/link
- Shipping text
- Checkout button label
- Trust badges
- Cart recommendations later

### 7. Dynamic Checkout And Success Page

Admin should control:

- Checkout heading
- Step labels
- Field helper text
- City list
- COD title/description
- Trust badges
- Button text/subtext
- WhatsApp help text
- Success page text
- Expected delivery time

Tracking events must remain active.

### 8. Dynamic Legal / Info Pages

Pages to move into Content Hub:

- About
- FAQ
- Contact
- Shipping
- Returns
- Privacy Policy
- Terms & Conditions
- Reviews

These should no longer require code changes for copy updates.

---

## Admin Redesign Plan

### 1. Sidebar Grouping

Replace flat sidebar with grouped navigation:

- Dashboard
- Content
- Store
- Orders
- Marketing
- Design
- Settings

This makes admin less confusing for clients.

### 2. Page Headers

Every admin page should use a consistent header:

- Title
- Description
- Primary action
- Secondary actions
- Status indicator if needed

### 3. Shared Admin Components

Create reusable admin components:

- AdminPageHeader
- AdminCard
- AdminTabs
- AdminTable
- AdminEmptyState
- AdminFormField
- AdminImagePicker
- AdminSectionBuilder
- AdminSaveBar
- AdminStatusBadge

### 4. Content Hub

Pages and blog should feel like one content system:

- Pages list
- Blog posts list
- Page templates
- Reusable sections
- Menus
- Media
- SEO fields
- Preview links
- Draft/publish workflow

### 5. Settings Hub

Split settings into tabs/cards:

- Brand
- Theme
- Header
- Footer
- Contact
- Checkout
- Shipping
- Payments
- SEO
- Tracking
- Custom Code
- Security

### 6. Safer Custom Code

Custom scripts should:

- Be clearly separated by placement
- Show warnings
- Support enable/disable
- Avoid breaking admin
- Be excluded from admin pages where needed

### 7. Preview And Publish Flow

Recommended:

- Save Draft
- Preview
- Publish
- Last updated info
- Basic revision history later

---

## Implementation Phases

### Phase 0: Audit And Cleanup Preparation

Goal: Create a safe baseline.

Tasks:

- List all hardcoded frontend headings/copy.
- List all admin pages and responsibilities.
- List current settings already available.
- Identify duplicated settings between `SiteSettings`, `StoreSettings`, and `Contact`.
- Create migration strategy for old page data.
- Confirm current tracking events before changes.

Deliverables:

- Static content audit list
- Settings mapping document
- Migration plan

### Phase 1: Admin Information Architecture

Goal: Make admin easier to use before adding complex features.

Tasks:

- Group sidebar navigation.
- Add consistent admin page headers.
- Create shared admin UI components.
- Improve Settings page layout into clear tabs/sections.
- Add better empty states and save states.

Deliverables:

- Cleaner admin sidebar
- Shared admin design components
- More professional settings layout

### Phase 2: Central Settings Refactor

Goal: Make brand, contact, footer, tracking, checkout, and store settings easier to manage.

Tasks:

- Keep existing database compatibility where possible.
- Create a central settings service/helper.
- Normalize frontend access to settings.
- Add settings fallbacks that are generic, not niche-specific.
- Move repeated contact usage to contact settings.
- Move checkout trust/copy to checkout settings.

Deliverables:

- Cleaner settings APIs
- Generic fallback values
- Frontend reads settings consistently

### Phase 3: Dynamic Header, Footer, Menus

Goal: Remove major hardcoded brand/navigation/footer limitations.

Tasks:

- Create menu models or JSON-backed menu settings.
- Build admin UI for header/footer menus.
- Replace hardcoded header nav.
- Replace hardcoded footer columns.
- Make announcement/search/support/footer copy dynamic.

Deliverables:

- Admin-managed header
- Admin-managed footer
- Admin-managed menus

### Phase 4: Page Builder Foundation

Goal: Make pages reusable and client-editable.

Tasks:

- Add `PageSection` structure.
- Create section renderer on frontend.
- Create section editor in admin.
- Support common sections first: Hero, Rich Text, Product Grid, Category Grid, FAQ, Trust Badges, CTA.
- Migrate current Home/About/Deals content into sections.

Deliverables:

- Generic page section model
- Admin page builder MVP
- Frontend section renderer

### Phase 5: Convert Public Pages To Dynamic Content

Goal: Remove static page content from source code.

Pages to convert:

- Home
- About
- FAQ
- Contact
- Shipping
- Returns
- Privacy
- Terms
- Reviews
- Deals
- Shop intro/SEO blocks
- Category intro/SEO blocks

Deliverables:

- Public pages editable from admin
- Legal/info pages reusable for any client
- No niche-specific hardcoded headings

### Phase 6: Checkout And Cart Configurability

Goal: Keep conversion-focused checkout but make it client-configurable.

Tasks:

- Add checkout settings admin.
- Make city list admin-editable.
- Make COD/payment content dynamic.
- Make checkout trust badges dynamic.
- Make order success page dynamic.
- Make cart page/drawer messages dynamic.
- Preserve Meta Pixel and Google Tag ecommerce events.

Deliverables:

- Dynamic checkout settings
- Dynamic success page copy
- Cart/checkout copy controlled by admin

### Phase 7: Blog And Content Hub Upgrade

Goal: Make blog and pages manageable from one professional content area.

Tasks:

- Improve blog list admin UX.
- Add blog categories/tags if missing.
- Improve author management.
- Add SEO preview.
- Add FAQ blocks for posts.
- Add related products management.
- Add draft/publish clarity.

Deliverables:

- Better blog management
- Content Hub navigation
- SEO-friendly blog workflow

### Phase 8: Tracking And Integrations Manager

Goal: Keep tracking powerful but safer and easier.

Tasks:

- Create integrations admin screen.
- Group Meta, Google, Clarity, custom scripts.
- Add enable/disable toggles.
- Add validation for IDs.
- Show ecommerce event checklist.
- Ensure scripts do not duplicate.

Deliverables:

- Central tracking manager
- Existing Meta/Google events preserved
- Safer custom code management

### Phase 9: White-Label Setup System

Goal: Make new client setup fast.

Tasks:

- Create generic seed templates.
- Remove old LuxStore/watches/water-bottle fallback content from source.
- Add onboarding checklist in admin.
- Add import/export for settings later.
- Add site reset/template apply flow later.

Deliverables:

- New store setup checklist
- Generic default content
- Client-ready configuration flow

### Phase 10: QA, Testing, And Production Hardening

Goal: Make changes stable.

Tasks:

- TypeScript checks.
- Build checks.
- API validation.
- Admin permission checks.
- Mobile responsiveness testing.
- Tracking event testing.
- SEO metadata testing.
- Migration testing with existing data.

Deliverables:

- Production-ready implementation
- Reduced regression risk
- Clear deployment checklist

---

## Priority Order

Recommended execution order:

1. Admin sidebar grouping and shared admin UI components
2. Settings hub cleanup
3. Dynamic header/footer/menus
4. Page builder foundation
5. Convert static pages
6. Checkout/cart settings
7. Blog/content hub upgrade
8. Tracking integrations manager
9. White-label setup flow
10. QA and documentation

Reason: Header/footer/settings affect the whole platform and unlock the biggest white-label value early. Page builder should come after settings foundation so it can reuse media, theme, menus, SEO, and global copy patterns.

---

## High-Impact Quick Wins

These can be done early with relatively low risk:

- Replace all `LuxStore` fallback text with generic setting-driven values.
- Make header navigation dynamic from settings/menu config.
- Make footer columns dynamic.
- Move footer copyright text fully into admin.
- Make WhatsApp/help links use contact settings everywhere.
- Add admin settings tabs instead of one long settings form.
- Add a simple `Global Copy` settings group for repeated labels.
- Make checkout city list admin-editable.
- Make home page static headings editable from page settings.

---

## Risks And Safeguards

### Risk: Breaking Existing Pages

Safeguard:

- Keep old fields while introducing new section system.
- Add fallback renderer for existing page data.
- Migrate one page at a time.

### Risk: Admin Becomes Too Complex

Safeguard:

- Use grouped settings.
- Hide advanced fields inside Advanced sections.
- Provide previews and clear labels.
- Keep default templates for non-technical users.

### Risk: Tracking Events Break

Safeguard:

- Do not remove existing event helpers.
- Add tests/manual verification for add-to-cart, begin-checkout, purchase.
- Build integrations manager around existing functions.

### Risk: Too Much Database Migration At Once

Safeguard:

- Add new models gradually.
- Keep old data readable.
- Use migration scripts.
- Convert pages one-by-one.

### Risk: White-Label Flexibility Hurts Performance

Safeguard:

- Cache site settings.
- Server-render common content.
- Avoid fetching settings repeatedly in every client component.
- Use CSS variables for theme values.

---

## Acceptance Criteria

The platform should be considered reusable/client-ready when:

- A new client can change logo, colors, store name, contact details, footer, menus, SEO, tracking, and checkout copy from admin.
- Public page headings and core copy are not hardcoded in source code.
- Home, About, FAQ, Shipping, Returns, Privacy, Terms, Contact, Blog, and core shop pages are admin-manageable.
- Header and footer are fully admin-managed.
- Checkout remains simple, mobile-first, COD-friendly, and tracking-safe.
- Meta Pixel and Google Tag events still fire for add-to-cart, begin checkout, and purchase.
- Admin panel is grouped, clean, and understandable for non-technical clients.
- Default content is generic and not tied to Sahoolat, LuxStore, water bottles, watches, or any one niche.
- Build and TypeScript checks pass after each phase.

---

## Suggested First Implementation Sprint

When implementation starts, the first sprint should be:

1. Create shared admin layout components.
2. Group admin sidebar navigation.
3. Clean Settings into organized sections.
4. Replace generic fallback brand text.
5. Make contact settings power WhatsApp/header/footer/checkout support links.
6. Document current tracking event locations before touching integrations.

This gives immediate admin quality improvement and prepares the foundation for deeper dynamic content work.

