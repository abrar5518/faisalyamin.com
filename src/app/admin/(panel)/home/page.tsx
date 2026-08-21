"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import { Fetch } from "@/lib/fetch";
import { DEFAULT_HOME_SECTIONS, type HomeSections } from "@/lib/homeContent";

type Pair = { title: string; desc: string };
type Faq = { question: string; answer: string };
type Review = { name: string; title?: string; quote?: string; avatarUrl?: string; rating?: number };
type HeroSlide = {
  id?: number;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  desktopImage: string;
  mobileImage: string;
  imageAlt: string;
  backgroundColor: string;
  accentColor: string;
  badgeText: string;
  isEnabled: boolean;
};

type HomeForm = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  shortDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  heroImage: string;
  heroImageAlt: string;
  heroCardTitle: string;
  heroCardSubtitle: string;
  heroCardPrimaryLabel: string;
  heroCardPrimaryHref: string;
  heroCardSecondaryLabel: string;
  heroCardSecondaryHref: string;
  heroHighlight1Title: string;
  heroHighlight1Desc: string;
  heroHighlight2Title: string;
  heroHighlight2Desc: string;
  heroHighlight3Title: string;
  heroHighlight3Desc: string;
  homeIntroTitle: string;
  homeIntroBody: string;
  homeBenefitsTitle: string;
  homeBenefitsIntro: string;
  homeBenefitsItems: Pair[];
  homeFaqTitle: string;
  homeFaqIntro: string;
  homeFaqItems: Faq[];
  homeSaleLimit: number;
  homeSaleVisibleCount: number;
  homeSaleAutoMs: number;
  homeTestimonials: Review[];
  heroSlides: HeroSlide[];
  sections: HomeSections;
};

const DEFAULT_FORM: HomeForm = {
  title: "Home",
  metaTitle: "Home",
  metaDescription: "Quality products, clear prices, secure checkout, and reliable delivery.",
  metaKeywords: "home, ecommerce, online shopping",
  shortDescription: "Shop best-selling products with secure checkout and reliable delivery.",
  heroBadge: "Trusted by customers",
  heroTitle: "Premium products, curated for people who care about details.",
  heroSubtitle: "Shop best-selling products with secure checkout, clear support, and reliable delivery.",
  heroPrimaryLabel: "Shop Now",
  heroPrimaryHref: "/shop",
  heroSecondaryLabel: "Browse Categories",
  heroSecondaryHref: "/categories",
  heroImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  heroImageAlt: "Featured products",
  heroCardTitle: "Featured products",
  heroCardSubtitle: "Explore popular picks from this store.",
  heroCardPrimaryLabel: "Shop All",
  heroCardPrimaryHref: "/shop",
  heroCardSecondaryLabel: "View Deals",
  heroCardSecondaryHref: "/deals",
  heroHighlight1Title: "Quality",
  heroHighlight1Desc: "Checked products",
  heroHighlight2Title: "Fast",
  heroHighlight2Desc: "Reliable dispatch",
  heroHighlight3Title: "Secure",
  heroHighlight3Desc: "Protected checkout",
  homeIntroTitle: "Introducing our featured products",
  homeIntroBody: "Discover quality products selected for everyday needs.",
  homeBenefitsTitle: "Benefits you can feel every day",
  homeBenefitsIntro: "Useful benefits customers should know before ordering.",
  homeBenefitsItems: [
    { title: "Durable build", desc: "Useful, reliable products for everyday use." },
    { title: "Fast support", desc: "Clear help before and after orders." },
    { title: "Secure checkout", desc: "Simple checkout with trusted payment flow." },
  ],
  homeFaqTitle: "FAQs about our products",
  homeFaqIntro: "Quick answers to help customers choose with confidence.",
  homeFaqItems: [
    { question: "Are products checked before dispatch?", answer: "Yes, products are checked according to store policy." },
    { question: "How long does delivery take?", answer: "Delivery depends on city and courier setup." },
  ],
  homeSaleLimit: 8,
  homeSaleVisibleCount: 4.5,
  homeSaleAutoMs: 4500,
  homeTestimonials: [],
  heroSlides: [
    {
      eyebrow: "The New Edit",
      title: "Quiet Luxury, Made for Every Day",
      description: "Modern wardrobe pieces with considered shape, texture, and detail.",
      primaryLabel: "Shop Women",
      primaryHref: "/shop",
      secondaryLabel: "Discover New In",
      secondaryHref: "/shop",
      desktopImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=92",
      mobileImage: "",
      imageAlt: "New season fashion collection",
      backgroundColor: "#f5efe6",
      accentColor: "#b36f49",
      badgeText: "New Drop",
      isEnabled: true,
    },
  ],
  sections: DEFAULT_HOME_SECTIONS,
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-700">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
        />
      )}
    </label>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

export default function AdminHomePage() {
  const [form, setForm] = useState<HomeForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const payload = useMemo(() => form, [form]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await Fetch<any>("/api/admin/home", { auth: true, cache: "no-store" });
      if (!alive) return;
      if (res.ok && res.data) {
        const d = res.data;
        setForm({
          ...DEFAULT_FORM,
          ...d,
          metaTitle: text(d.metaTitle, DEFAULT_FORM.metaTitle),
          metaDescription: text(d.metaDescription, DEFAULT_FORM.metaDescription),
          metaKeywords: text(d.metaKeywords, DEFAULT_FORM.metaKeywords),
          shortDescription: text(d.shortDescription, DEFAULT_FORM.shortDescription),
          heroImageAlt: text(d.heroImageAlt, DEFAULT_FORM.heroImageAlt),
          homeBenefitsItems: d.homeBenefitsItems?.length ? d.homeBenefitsItems : DEFAULT_FORM.homeBenefitsItems,
          homeFaqItems: d.homeFaqItems?.length ? d.homeFaqItems : DEFAULT_FORM.homeFaqItems,
          homeTestimonials: d.homeTestimonials ?? [],
          sections: { ...DEFAULT_HOME_SECTIONS, ...(d.sections ?? {}) },
        });
      } else {
        setMsg(res.error || "Failed to load home page.");
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  function set<K extends keyof HomeForm>(key: K, value: HomeForm[K]) {
    setForm((x) => ({ ...x, [key]: value }));
  }

  function setSection<K extends keyof HomeSections>(key: K, value: HomeSections[K]) {
    setForm((x) => ({ ...x, sections: { ...x.sections, [key]: value } }));
  }

  function updateArray<T>(key: keyof HomeForm, idx: number, value: Partial<T>) {
    setForm((x) => {
      const next = [...((x[key] as T[]) ?? [])] as any[];
      next[idx] = { ...next[idx], ...value };
      return { ...x, [key]: next };
    });
  }

  function removeArray(key: keyof HomeForm, idx: number) {
    setForm((x) => ({ ...x, [key]: ((x[key] as any[]) ?? []).filter((_, i) => i !== idx) as any }));
  }

  function moveHeroSlide(index: number, direction: -1 | 1) {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.heroSlides.length) return current;
      const heroSlides = [...current.heroSlides];
      [heroSlides[index], heroSlides[target]] = [heroSlides[target], heroSlides[index]];
      return { ...current, heroSlides };
    });
  }

  function addHeroSlide() {
    set("heroSlides", [
      ...form.heroSlides,
      {
        eyebrow: "New Collection",
        title: "Add your slide headline",
        description: "Add supporting copy for this campaign.",
        primaryLabel: "Shop Now",
        primaryHref: "/shop",
        secondaryLabel: "View Collection",
        secondaryHref: "/categories",
        desktopImage: "",
        mobileImage: "",
        imageAlt: "",
        backgroundColor: "#f5efe6",
        accentColor: "#b36f49",
        badgeText: "New Drop",
        isEnabled: true,
      },
    ]);
  }

  async function onSave() {
    setSaving(true);
    setMsg(null);
    const res = await Fetch("/api/admin/home", { method: "PUT", auth: true, data: payload });
    setSaving(false);
    setMsg(res.ok ? "Home page updated." : res.error || "Failed to save home page.");
  }

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Home" />
        <div className="px-5 py-10 text-sm text-neutral-600 sm:px-8 lg:px-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Home" />
      <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Home page settings</p>
            <p className="mt-1 text-xs text-neutral-500">Dedicated editor for the storefront home page. No long description field.</p>
          </div>
          <button onClick={onSave} disabled={saving} className="rounded-2xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {msg ? <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm">{msg}</div> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Panel title="SEO">
              <Field label="Page title" value={form.title} onChange={(v) => set("title", v)} />
              <Field label="Meta title" value={form.metaTitle} onChange={(v) => set("metaTitle", v)} />
              <Field label="Meta description" value={form.metaDescription} onChange={(v) => set("metaDescription", v)} multiline />
              <Field label="Meta keywords" value={form.metaKeywords} onChange={(v) => set("metaKeywords", v)} />
            </Panel>

            <Panel title="Hero slider">
              <div className="grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={form.sections.heroSliderEnabled} onChange={(e) => setSection("heroSliderEnabled", e.target.checked)} />
                  Show hero slider
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={form.sections.heroSliderAutoPlay} onChange={(e) => setSection("heroSliderAutoPlay", e.target.checked)} />
                  Auto play
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={form.sections.heroSliderShowArrows} onChange={(e) => setSection("heroSliderShowArrows", e.target.checked)} />
                  Show arrows
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={form.sections.heroSliderShowDots} onChange={(e) => setSection("heroSliderShowDots", e.target.checked)} />
                  Show slide indicators
                </label>
                <Field label="Auto slide interval (ms)" type="number" value={form.sections.heroSliderIntervalMs} onChange={(v) => setSection("heroSliderIntervalMs", Number(v))} />
              </div>

              {form.heroSlides.map((slide, idx) => (
                <div key={slide.id ?? `new-${idx}`} className="rounded-3xl border border-neutral-200 p-5">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Slide {idx + 1}</p>
                      <label className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                        <input type="checkbox" checked={slide.isEnabled} onChange={(e) => updateArray<HeroSlide>("heroSlides", idx, { isEnabled: e.target.checked })} />
                        Enabled
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={idx === 0} onClick={() => moveHeroSlide(idx, -1)} className="rounded-xl border border-neutral-200 px-3 py-2 text-xs disabled:opacity-40">Move up</button>
                      <button type="button" disabled={idx === form.heroSlides.length - 1} onClick={() => moveHeroSlide(idx, 1)} className="rounded-xl border border-neutral-200 px-3 py-2 text-xs disabled:opacity-40">Move down</button>
                      <button type="button" onClick={() => removeArray("heroSlides", idx)} className="rounded-xl border border-red-200 px-3 py-2 text-xs text-red-600">Remove</button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Eyebrow" value={slide.eyebrow} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { eyebrow: v })} />
                      <Field label="Badge text" value={slide.badgeText} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { badgeText: v })} />
                    </div>
                    <Field label="Headline" value={slide.title} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { title: v })} multiline />
                    <Field label="Description" value={slide.description} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { description: v })} multiline />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Primary button label" value={slide.primaryLabel} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { primaryLabel: v })} />
                      <Field label="Primary button link" value={slide.primaryHref} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { primaryHref: v })} />
                      <Field label="Secondary button label" value={slide.secondaryLabel} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { secondaryLabel: v })} />
                      <Field label="Secondary button link" value={slide.secondaryHref} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { secondaryHref: v })} />
                      <Field label="Background color" type="color" value={slide.backgroundColor} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { backgroundColor: v })} />
                      <Field label="Accent color" type="color" value={slide.accentColor} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { accentColor: v })} />
                    </div>
                    <ImageUploader
                      title="Desktop hero image"
                      value={slide.desktopImage ? [{ url: slide.desktopImage, alt: slide.imageAlt }] : []}
                      onChange={(images) => updateArray<HeroSlide>("heroSlides", idx, { desktopImage: images[0]?.url || "", imageAlt: images[0]?.alt || slide.imageAlt })}
                      max={1}
                      kind="product"
                    />
                    <ImageUploader
                      title="Mobile hero image (optional)"
                      value={slide.mobileImage ? [{ url: slide.mobileImage, alt: slide.imageAlt }] : []}
                      onChange={(images) => updateArray<HeroSlide>("heroSlides", idx, { mobileImage: images[0]?.url || "" })}
                      max={1}
                      kind="product"
                    />
                    <Field label="Image alt text" value={slide.imageAlt} onChange={(v) => updateArray<HeroSlide>("heroSlides", idx, { imageAlt: v })} />
                  </div>
                </div>
              ))}

              <button type="button" onClick={addHeroSlide} className="rounded-2xl border border-neutral-900 px-4 py-3 text-sm font-medium">
                Add another slide
              </button>
            </Panel>

            <Panel title="Intro and benefits">
              <Field label="Intro badge" value={form.sections.introBadge} onChange={(v) => setSection("introBadge", v)} />
              <Field label="Intro title" value={form.homeIntroTitle} onChange={(v) => set("homeIntroTitle", v)} />
              <Field label="Intro text" value={form.homeIntroBody} onChange={(v) => set("homeIntroBody", v)} multiline />
              <Field label="Benefits title" value={form.homeBenefitsTitle} onChange={(v) => set("homeBenefitsTitle", v)} />
              <Field label="Benefits intro" value={form.homeBenefitsIntro} onChange={(v) => set("homeBenefitsIntro", v)} multiline />
              {form.homeBenefitsItems.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-neutral-200 p-4">
                  <Field label="Benefit title" value={item.title} onChange={(v) => updateArray<Pair>("homeBenefitsItems", idx, { title: v })} />
                  <div className="mt-3">
                    <Field label="Benefit text" value={item.desc} onChange={(v) => updateArray<Pair>("homeBenefitsItems", idx, { desc: v })} multiline />
                  </div>
                  <button type="button" onClick={() => removeArray("homeBenefitsItems", idx)} className="mt-3 text-xs font-medium text-red-600">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => set("homeBenefitsItems", [...form.homeBenefitsItems, { title: "", desc: "" }])} className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm">Add benefit</button>
            </Panel>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <Panel title="Deals section">
              <Field label="Title" value={form.sections.saleTitle} onChange={(v) => setSection("saleTitle", v)} />
              <Field label="Subtitle" value={form.sections.saleSubtitle} onChange={(v) => setSection("saleSubtitle", v)} multiline />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="View label" value={form.sections.saleViewAllLabel} onChange={(v) => setSection("saleViewAllLabel", v)} />
                <Field label="View link" value={form.sections.saleViewAllHref} onChange={(v) => setSection("saleViewAllHref", v)} />
                <Field label="Product limit" type="number" value={form.homeSaleLimit} onChange={(v) => set("homeSaleLimit", Number(v))} />
                <Field label="Visible cards" type="number" value={form.homeSaleVisibleCount} onChange={(v) => set("homeSaleVisibleCount", Number(v))} />
                <Field label="Auto slide ms" type="number" value={form.homeSaleAutoMs} onChange={(v) => set("homeSaleAutoMs", Number(v))} />
              </div>
            </Panel>

            <Panel title="Categories and featured products">
              <Field label="Category title" value={form.sections.categoryTitle} onChange={(v) => setSection("categoryTitle", v)} />
              <Field label="Category subtitle" value={form.sections.categorySubtitle} onChange={(v) => setSection("categorySubtitle", v)} multiline />
              <Field label="Category view label" value={form.sections.categoryViewAllLabel} onChange={(v) => setSection("categoryViewAllLabel", v)} />
              <Field label="Category view link" value={form.sections.categoryViewAllHref} onChange={(v) => setSection("categoryViewAllHref", v)} />
              <Field label="Featured title" value={form.sections.featuredTitle} onChange={(v) => setSection("featuredTitle", v)} />
              <Field label="Featured subtitle" value={form.sections.featuredSubtitle} onChange={(v) => setSection("featuredSubtitle", v)} multiline />
              <Field label="Filter labels (comma separated)" value={form.sections.featuredTabs.join(", ")} onChange={(v) => setSection("featuredTabs", v.split(",").map((x) => x.trim()).filter(Boolean))} />
            </Panel>

            <Panel title="Social proof">
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={form.sections.socialProofEnabled} onChange={(e) => setSection("socialProofEnabled", e.target.checked)} />
                Show social proof strip
              </label>
              {form.sections.socialProofItems.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-neutral-200 p-4">
                  <Field label="Title" value={item.title} onChange={(v) => {
                    const next = [...form.sections.socialProofItems];
                    next[idx] = { ...next[idx], title: v };
                    setSection("socialProofItems", next);
                  }} />
                  <div className="mt-3">
                    <Field label="Text" value={item.desc} onChange={(v) => {
                      const next = [...form.sections.socialProofItems];
                      next[idx] = { ...next[idx], desc: v };
                      setSection("socialProofItems", next);
                    }} multiline />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSection("socialProofItems", form.sections.socialProofItems.filter((_, i) => i !== idx))}
                    className="mt-3 text-xs font-medium text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSection("socialProofItems", [...form.sections.socialProofItems, { title: "", desc: "" }])}
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm"
              >
                Add social proof item
              </button>
            </Panel>

            <Panel title="Reviews and FAQ">
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={form.sections.reviewsEnabled} onChange={(e) => setSection("reviewsEnabled", e.target.checked)} />
                Show reviews section
              </label>
              <Field label="Reviews badge" value={form.sections.reviewsBadge} onChange={(v) => setSection("reviewsBadge", v)} />
              <Field label="Reviews title" value={form.sections.reviewsTitle} onChange={(v) => setSection("reviewsTitle", v)} />
              <Field label="Reviews subtitle" value={form.sections.reviewsSubtitle} onChange={(v) => setSection("reviewsSubtitle", v)} multiline />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Reviews link label" value={form.sections.reviewsLinkLabel} onChange={(v) => setSection("reviewsLinkLabel", v)} />
                <Field label="Reviews link" value={form.sections.reviewsLinkHref} onChange={(v) => setSection("reviewsLinkHref", v)} />
              </div>
              <Field label="FAQ title" value={form.homeFaqTitle} onChange={(v) => set("homeFaqTitle", v)} />
              <Field label="FAQ intro" value={form.homeFaqIntro} onChange={(v) => set("homeFaqIntro", v)} multiline />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="FAQ link label" value={form.sections.faqLinkLabel} onChange={(v) => setSection("faqLinkLabel", v)} />
                <Field label="FAQ link" value={form.sections.faqLinkHref} onChange={(v) => setSection("faqLinkHref", v)} />
              </div>
              {form.homeFaqItems.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-neutral-200 p-4">
                  <Field label="Question" value={item.question} onChange={(v) => updateArray<Faq>("homeFaqItems", idx, { question: v })} />
                  <div className="mt-3">
                    <Field label="Answer" value={item.answer} onChange={(v) => updateArray<Faq>("homeFaqItems", idx, { answer: v })} multiline />
                  </div>
                  <button type="button" onClick={() => removeArray("homeFaqItems", idx)} className="mt-3 text-xs font-medium text-red-600">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => set("homeFaqItems", [...form.homeFaqItems, { question: "", answer: "" }])} className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm">Add FAQ</button>
            </Panel>

            <Panel title="Review cards">
              {form.homeTestimonials.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-neutral-200 p-4">
                  <Field label="Name" value={item.name} onChange={(v) => updateArray<Review>("homeTestimonials", idx, { name: v })} />
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Field label="City/title" value={item.title ?? ""} onChange={(v) => updateArray<Review>("homeTestimonials", idx, { title: v })} />
                    <Field label="Rating" type="number" value={item.rating ?? 5} onChange={(v) => updateArray<Review>("homeTestimonials", idx, { rating: Number(v) })} />
                  </div>
                  <div className="mt-3">
                    <Field label="Quote" value={item.quote ?? ""} onChange={(v) => updateArray<Review>("homeTestimonials", idx, { quote: v })} multiline />
                  </div>
                  <div className="mt-3">
                    <Field label="Avatar URL" value={item.avatarUrl ?? ""} onChange={(v) => updateArray<Review>("homeTestimonials", idx, { avatarUrl: v })} />
                  </div>
                  <button type="button" onClick={() => removeArray("homeTestimonials", idx)} className="mt-3 text-xs font-medium text-red-600">Remove</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => set("homeTestimonials", [...form.homeTestimonials, { name: "", title: "", quote: "", avatarUrl: "", rating: 5 }])}
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm"
              >
                Add review card
              </button>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  );
}
