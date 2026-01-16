"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import { Fetch } from "@/lib/fetch";
import { AboutContent, defaultAboutContent } from "@/lib/aboutContent";

type PageForm = {
  title: string;
  slug: string;
  contentHtml: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  shortDescription: string;
  featureImage: string;
  featureImageAlt: string;
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
  homeBenefitsItems: Array<{ title: string; desc: string }>;
  homeFaqTitle: string;
  homeFaqIntro: string;
  homeFaqItems: Array<{ question: string; answer: string }>;
  homeSaleLimit: number;
  homeSaleVisibleCount: number;
  homeSaleAutoMs: number;
  homeTestimonials: Array<{
    name: string;
    title: string;
    quote: string;
    avatarUrl: string;
    rating: number;
  }>;
};

const EMPTY_FORM: PageForm = {
  title: "",
  slug: "",
  contentHtml: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  shortDescription: "",
  featureImage: "",
  featureImageAlt: "",
  heroBadge: "",
  heroTitle: "",
  heroSubtitle: "",
  heroPrimaryLabel: "",
  heroPrimaryHref: "",
  heroSecondaryLabel: "",
  heroSecondaryHref: "",
  heroImage: "",
  heroImageAlt: "",
  heroCardTitle: "",
  heroCardSubtitle: "",
  heroCardPrimaryLabel: "",
  heroCardPrimaryHref: "",
  heroCardSecondaryLabel: "",
  heroCardSecondaryHref: "",
  heroHighlight1Title: "",
  heroHighlight1Desc: "",
  heroHighlight2Title: "",
  heroHighlight2Desc: "",
  heroHighlight3Title: "",
  heroHighlight3Desc: "",
  homeIntroTitle: "",
  homeIntroBody: "",
  homeBenefitsTitle: "",
  homeBenefitsIntro: "",
  homeBenefitsItems: [{ title: "", desc: "" }],
  homeFaqTitle: "",
  homeFaqIntro: "",
  homeFaqItems: [{ question: "", answer: "" }],
  homeSaleLimit: 8,
  homeSaleVisibleCount: 4.5,
  homeSaleAutoMs: 4500,
  homeTestimonials: [{ name: "", title: "", quote: "", avatarUrl: "", rating: 5 }],
};

const ABOUT_SLUG = "about-us";

export default function AdminPageEdit() {
  const params = useParams<{ slug?: string | string[] }>();
  const slugParam = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug;
  const slug = slugParam ?? "";

  const [form, setForm] = useState<PageForm>(EMPTY_FORM);
  const [aboutForm, setAboutForm] = useState<AboutContent>(defaultAboutContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const originalSlug = useMemo(() => slug, [slug]);
  const isAbout = originalSlug === ABOUT_SLUG;
  const isHome = originalSlug === "home";

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!slug) {
      setMsg("Missing page slug.");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setMsg(null);
      const res = await Fetch(`/api/admin/pages?slug=${encodeURIComponent(slug)}`, {
        auth: true,
        cache: "no-store",
      });
      if (!res.ok || !res.data) {
        setMsg(res.error || "Failed to load page.");
        setLoading(false);
        return;
      }
      const data: any = res.data;
      setForm({
        title: data.title ?? "",
        slug: data.slug ?? slug,
        contentHtml: isAbout ? "" : data.contentHtml ?? "",
        metaTitle: data.metaTitle ?? "",
        metaDescription: data.metaDescription ?? "",
        metaKeywords: data.metaKeywords ?? "",
        shortDescription: data.shortDescription ?? "",
        featureImage: data.featureImage ?? "",
        featureImageAlt: data.featureImageAlt ?? "",
        heroBadge: data.heroBadge ?? "",
        heroTitle: data.heroTitle ?? "",
        heroSubtitle: data.heroSubtitle ?? "",
        heroPrimaryLabel: data.heroPrimaryLabel ?? "",
        heroPrimaryHref: data.heroPrimaryHref ?? "",
        heroSecondaryLabel: data.heroSecondaryLabel ?? "",
        heroSecondaryHref: data.heroSecondaryHref ?? "",
        heroImage: data.heroImage ?? "",
        heroImageAlt: data.heroImageAlt ?? "",
        heroCardTitle: data.heroCardTitle ?? "",
        heroCardSubtitle: data.heroCardSubtitle ?? "",
        heroCardPrimaryLabel: data.heroCardPrimaryLabel ?? "",
        heroCardPrimaryHref: data.heroCardPrimaryHref ?? "",
        heroCardSecondaryLabel: data.heroCardSecondaryLabel ?? "",
        heroCardSecondaryHref: data.heroCardSecondaryHref ?? "",
        heroHighlight1Title: data.heroHighlight1Title ?? "",
        heroHighlight1Desc: data.heroHighlight1Desc ?? "",
        heroHighlight2Title: data.heroHighlight2Title ?? "",
        heroHighlight2Desc: data.heroHighlight2Desc ?? "",
        heroHighlight3Title: data.heroHighlight3Title ?? "",
        heroHighlight3Desc: data.heroHighlight3Desc ?? "",
        homeIntroTitle: data.homeIntroTitle ?? "",
        homeIntroBody: data.homeIntroBody ?? "",
        homeBenefitsTitle: data.homeBenefitsTitle ?? "",
        homeBenefitsIntro: data.homeBenefitsIntro ?? "",
        homeBenefitsItems: Array.isArray(data.homeBenefits)
          ? data.homeBenefits.map((item: any) => ({
              title: item.title ?? "",
              desc: item.desc ?? "",
            }))
          : Array.isArray(data.homeBenefitsItems) && data.homeBenefitsItems.length
            ? data.homeBenefitsItems.map((item: any) => ({
                title: item.title ?? "",
                desc: item.desc ?? "",
              }))
            : [{ title: "", desc: "" }],
        homeFaqTitle: data.homeFaqTitle ?? "",
        homeFaqIntro: data.homeFaqIntro ?? "",
        homeFaqItems: Array.isArray(data.homeFaqItems) && data.homeFaqItems.length
          ? data.homeFaqItems.map((item: any) => ({
              question: item.question ?? "",
              answer: item.answer ?? "",
            }))
          : [{ question: "", answer: "" }],
        homeSaleLimit: typeof data.homeSaleLimit === "number" ? data.homeSaleLimit : 8,
        homeSaleVisibleCount: typeof data.homeSaleVisibleCount === "number" ? data.homeSaleVisibleCount : 4.5,
        homeSaleAutoMs: typeof data.homeSaleAutoMs === "number" ? data.homeSaleAutoMs : 4500,
        homeTestimonials: Array.isArray(data.homeTestimonials) && data.homeTestimonials.length
          ? data.homeTestimonials.map((item: any) => ({
              name: item.name ?? "",
              title: item.title ?? "",
              quote: item.quote ?? "",
              avatarUrl: item.avatarUrl ?? "",
              rating: typeof item.rating === "number" ? item.rating : 5,
            }))
          : [{ name: "", title: "", quote: "", avatarUrl: "", rating: 5 }],
      });
      if (isAbout) {
        const aboutRes = await Fetch<AboutContent>(
          `/api/admin/about?slug=${encodeURIComponent(slug)}`,
          { auth: true, cache: "no-store" }
        );
        if (aboutRes.ok && aboutRes.data) {
          setAboutForm(aboutRes.data as AboutContent);
        } else {
          setAboutForm(defaultAboutContent);
        }
      }
      setLoading(false);
    })();
  }, [slug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const onSave = async () => {
    if (!originalSlug) return;
    setSaving(true);
    setMsg(null);
    const contentHtml = isAbout ? JSON.stringify(aboutForm, null, 2) : form.contentHtml;
    const cleanedFaqItems = form.homeFaqItems
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question && item.answer);
    const cleanedBenefitItems = form.homeBenefitsItems
      .map((item) => ({
        title: item.title.trim(),
        desc: item.desc.trim(),
      }))
      .filter((item) => item.title && item.desc);
    const cleanedTestimonials = form.homeTestimonials
      .map((item) => ({
        name: item.name.trim(),
        title: item.title.trim(),
        quote: item.quote.trim(),
        avatarUrl: item.avatarUrl.trim(),
        rating: Number.isFinite(item.rating) ? Math.max(0, Math.min(5, item.rating)) : 5,
      }))
      .filter((item) => item.name && item.quote);
    const payload: any = {
      ...form,
      contentHtml,
      homeBenefitsItems: cleanedBenefitItems,
      homeFaqItems: cleanedFaqItems,
      homeTestimonials: cleanedTestimonials,
    };
    if (!isHome) {
      delete payload.homeBenefitsItems;
      delete payload.homeFaqItems;
      delete payload.homeTestimonials;
    }
    const res = await Fetch(`/api/admin/pages?slug=${encodeURIComponent(originalSlug)}`, {
      method: "PUT",
      auth: true,
      data: payload,
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to save page.");
      setSaving(false);
      return;
    }

    if (isAbout) {
      const aboutRes = await Fetch(`/api/admin/about?slug=${encodeURIComponent(originalSlug)}`, {
        method: "PUT",
        auth: true,
        data: aboutForm,
      });
      if (!aboutRes.ok) {
        setMsg(aboutRes.error || "Failed to save About sections.");
        setSaving(false);
        return;
      }
    }
    setMsg("Page updated.");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Edit Page" />
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Edit Page" />

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Edit page</p>
            <p className="mt-1 text-xs text-neutral-500">Slug: {form.slug || "-"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/pages"
              className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Back
            </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Basics</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((x) => ({ ...x, title: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((x) => ({ ...x, slug: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO metadata</p>
              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta title</label>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => setForm((x) => ({ ...x, metaTitle: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta description</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm((x) => ({ ...x, metaDescription: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                  <input
                    value={form.metaKeywords}
                    onChange={(e) => setForm((x) => ({ ...x, metaKeywords: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            {form.slug !== "deals" ? (
              <>
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Hero (left column)</p>
                  <div className="mt-5 grid gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Badge text</label>
                      <input
                        value={form.heroBadge}
                        onChange={(e) => setForm((x) => ({ ...x, heroBadge: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Headline</label>
                      <textarea
                        value={form.heroTitle}
                        onChange={(e) => setForm((x) => ({ ...x, heroTitle: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Subtitle</label>
                      <textarea
                        value={form.heroSubtitle}
                        onChange={(e) => setForm((x) => ({ ...x, heroSubtitle: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Primary button label</label>
                        <input
                          value={form.heroPrimaryLabel}
                          onChange={(e) => setForm((x) => ({ ...x, heroPrimaryLabel: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Primary button link</label>
                        <input
                          value={form.heroPrimaryHref}
                          onChange={(e) => setForm((x) => ({ ...x, heroPrimaryHref: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Secondary button label</label>
                        <input
                          value={form.heroSecondaryLabel}
                          onChange={(e) => setForm((x) => ({ ...x, heroSecondaryLabel: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Secondary button link</label>
                        <input
                          value={form.heroSecondaryHref}
                          onChange={(e) => setForm((x) => ({ ...x, heroSecondaryHref: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {!isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Hero highlights (3 cards)</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Highlight 1 title</label>
                        <input
                          value={form.heroHighlight1Title}
                          onChange={(e) => setForm((x) => ({ ...x, heroHighlight1Title: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Highlight 1 description</label>
                        <input
                          value={form.heroHighlight1Desc}
                          onChange={(e) => setForm((x) => ({ ...x, heroHighlight1Desc: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Highlight 2 title</label>
                        <input
                          value={form.heroHighlight2Title}
                          onChange={(e) => setForm((x) => ({ ...x, heroHighlight2Title: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Highlight 2 description</label>
                        <input
                          value={form.heroHighlight2Desc}
                          onChange={(e) => setForm((x) => ({ ...x, heroHighlight2Desc: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Highlight 3 title</label>
                        <input
                          value={form.heroHighlight3Title}
                          onChange={(e) => setForm((x) => ({ ...x, heroHighlight3Title: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Highlight 3 description</label>
                        <input
                          value={form.heroHighlight3Desc}
                          onChange={(e) => setForm((x) => ({ ...x, heroHighlight3Desc: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {isHome ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Home SEO sections</p>
                    <div className="mt-5 grid gap-4">
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Introducing products title</label>
                        <input
                          value={form.homeIntroTitle}
                          onChange={(e) => setForm((x) => ({ ...x, homeIntroTitle: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Introducing products body</label>
                        <textarea
                          value={form.homeIntroBody}
                          onChange={(e) => setForm((x) => ({ ...x, homeIntroBody: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Benefits title</label>
                        <input
                          value={form.homeBenefitsTitle}
                          onChange={(e) => setForm((x) => ({ ...x, homeBenefitsTitle: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Benefits intro</label>
                        <textarea
                          value={form.homeBenefitsIntro}
                          onChange={(e) => setForm((x) => ({ ...x, homeBenefitsIntro: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Benefits cards</label>
                        <div className="mt-2 space-y-3">
                          {form.homeBenefitsItems.map((item, idx) => (
                            <div key={`home-benefit-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3">
                                <input
                                  value={item.title}
                                  onChange={(e) =>
                                    setForm((x) => {
                                      const homeBenefitsItems = [...x.homeBenefitsItems];
                                      homeBenefitsItems[idx] = { ...homeBenefitsItems[idx], title: e.target.value };
                                      return { ...x, homeBenefitsItems };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Benefit title"
                                />
                                <textarea
                                  value={item.desc}
                                  onChange={(e) =>
                                    setForm((x) => {
                                      const homeBenefitsItems = [...x.homeBenefitsItems];
                                      homeBenefitsItems[idx] = { ...homeBenefitsItems[idx], desc: e.target.value };
                                      return { ...x, homeBenefitsItems };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  rows={2}
                                  placeholder="Benefit description"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setForm((x) => {
                                      const homeBenefitsItems = x.homeBenefitsItems.filter((_, i) => i !== idx);
                                      return {
                                        ...x,
                                        homeBenefitsItems: homeBenefitsItems.length
                                          ? homeBenefitsItems
                                          : [{ title: "", desc: "" }],
                                      };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  Remove benefit
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((x) => ({
                                ...x,
                                homeBenefitsItems: [...x.homeBenefitsItems, { title: "", desc: "" }],
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add benefit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isHome ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Home FAQs</p>
                    <div className="mt-5 grid gap-4">
                      <div>
                        <label className="text-xs font-medium text-neutral-700">FAQ title</label>
                        <input
                          value={form.homeFaqTitle}
                          onChange={(e) => setForm((x) => ({ ...x, homeFaqTitle: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">FAQ intro</label>
                        <textarea
                          value={form.homeFaqIntro}
                          onChange={(e) => setForm((x) => ({ ...x, homeFaqIntro: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">FAQ items</label>
                        <div className="mt-2 space-y-3">
                          {form.homeFaqItems.map((item, idx) => (
                            <div key={`home-faq-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3">
                                <input
                                  value={item.question}
                                  onChange={(e) =>
                                    setForm((x) => {
                                      const homeFaqItems = [...x.homeFaqItems];
                                      homeFaqItems[idx] = { ...homeFaqItems[idx], question: e.target.value };
                                      return { ...x, homeFaqItems };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Question"
                                />
                                <textarea
                                  value={item.answer}
                                  onChange={(e) =>
                                    setForm((x) => {
                                      const homeFaqItems = [...x.homeFaqItems];
                                      homeFaqItems[idx] = { ...homeFaqItems[idx], answer: e.target.value };
                                      return { ...x, homeFaqItems };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  rows={2}
                                  placeholder="Answer"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setForm((x) => {
                                      const homeFaqItems = x.homeFaqItems.filter((_, i) => i !== idx);
                                      return {
                                        ...x,
                                        homeFaqItems: homeFaqItems.length
                                          ? homeFaqItems
                                          : [{ question: "", answer: "" }],
                                      };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  Remove FAQ
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((x) => ({
                                ...x,
                                homeFaqItems: [...x.homeFaqItems, { question: "", answer: "" }],
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add FAQ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isHome ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Home sale slider</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Visible cards</label>
                        <input
                          type="number"
                          min={1}
                          max={6}
                          step={0.5}
                          value={form.homeSaleVisibleCount}
                          onChange={(e) =>
                            setForm((x) => ({
                              ...x,
                              homeSaleVisibleCount: Number(e.target.value) || 1,
                            }))
                          }
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                        <p className="mt-1 text-xs text-neutral-500">Example: 4 or 4.5</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Max items</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          step={1}
                          value={form.homeSaleLimit}
                          onChange={(e) =>
                            setForm((x) => ({
                              ...x,
                              homeSaleLimit: Math.max(1, Number(e.target.value) || 1),
                            }))
                          }
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                        <p className="mt-1 text-xs text-neutral-500">Number of sale items to show</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Auto scroll (ms)</label>
                        <input
                          type="number"
                          min={1000}
                          max={20000}
                          step={100}
                          value={form.homeSaleAutoMs}
                          onChange={(e) =>
                            setForm((x) => ({
                              ...x,
                              homeSaleAutoMs: Math.max(1000, Number(e.target.value) || 1000),
                            }))
                          }
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                        <p className="mt-1 text-xs text-neutral-500">4500 = 4.5 seconds</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isHome ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Home testimonials</p>
                    <div className="mt-5">
                      <div className="space-y-3">
                        {form.homeTestimonials.map((item, idx) => (
                          <div key={`home-testimonial-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                            <div className="grid gap-3">
                              <input
                                value={item.name}
                                onChange={(e) =>
                                  setForm((x) => {
                                    const homeTestimonials = [...x.homeTestimonials];
                                    homeTestimonials[idx] = {
                                      ...homeTestimonials[idx],
                                      name: e.target.value,
                                    };
                                    return { ...x, homeTestimonials };
                                  })
                                }
                                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                placeholder="Name"
                              />
                              <input
                                value={item.title}
                                onChange={(e) =>
                                  setForm((x) => {
                                    const homeTestimonials = [...x.homeTestimonials];
                                    homeTestimonials[idx] = {
                                      ...homeTestimonials[idx],
                                      title: e.target.value,
                                    };
                                    return { ...x, homeTestimonials };
                                  })
                                }
                                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                placeholder="Location / title"
                              />
                              <ImageUploader
                                title="Avatar image"
                                hint="Upload a single square image for this testimonial."
                                value={item.avatarUrl ? [{ url: item.avatarUrl, alt: item.name }] : []}
                                onChange={(imgs) =>
                                  setForm((x) => {
                                    const homeTestimonials = [...x.homeTestimonials];
                                    homeTestimonials[idx] = {
                                      ...homeTestimonials[idx],
                                      avatarUrl: imgs[0]?.url || "",
                                    };
                                    return { ...x, homeTestimonials };
                                  })
                                }
                                max={1}
                                kind="testimonial"
                              />
                              <textarea
                                value={item.quote}
                                onChange={(e) =>
                                  setForm((x) => {
                                    const homeTestimonials = [...x.homeTestimonials];
                                    homeTestimonials[idx] = {
                                      ...homeTestimonials[idx],
                                      quote: e.target.value,
                                    };
                                    return { ...x, homeTestimonials };
                                  })
                                }
                                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                rows={2}
                                placeholder="Testimonial message"
                              />
                              <div>
                                <label className="text-xs font-medium text-neutral-700">Rating (0-5)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={5}
                                  step={0.5}
                                  value={item.rating}
                                  onChange={(e) =>
                                    setForm((x) => {
                                      const homeTestimonials = [...x.homeTestimonials];
                                      const next = Number(e.target.value);
                                      homeTestimonials[idx] = {
                                        ...homeTestimonials[idx],
                                        rating: Number.isFinite(next) ? next : 5,
                                      };
                                      return { ...x, homeTestimonials };
                                    })
                                  }
                                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((x) => {
                                    const homeTestimonials = x.homeTestimonials.filter((_, i) => i !== idx);
                                    return {
                                      ...x,
                                      homeTestimonials: homeTestimonials.length
                                        ? homeTestimonials
                                        : [{ name: "", title: "", quote: "", avatarUrl: "", rating: 5 }],
                                    };
                                  })
                                }
                                className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                              >
                                Remove testimonial
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setForm((x) => ({
                              ...x,
                              homeTestimonials: [
                                ...x.homeTestimonials,
                                { name: "", title: "", quote: "", avatarUrl: "", rating: 5 },
                              ],
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                        >
                          Add testimonial
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Hero extras</p>
                    <div className="mt-5 grid gap-4">
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Breadcrumb label</label>
                        <input
                          value={aboutForm.breadcrumbLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({ ...x, breadcrumbLabel: e.target.value }))
                          }
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Hero chips</label>
                        <div className="mt-2 space-y-2">
                          {aboutForm.heroExtras.chips.map((chip, idx) => (
                            <div key={`hero-chip-${idx}`} className="flex gap-2">
                              <input
                                value={chip}
                                onChange={(e) =>
                                  setAboutForm((x) => {
                                    const chips = [...x.heroExtras.chips];
                                    chips[idx] = e.target.value;
                                    return { ...x, heroExtras: { ...x.heroExtras, chips } };
                                  })
                                }
                                className="w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setAboutForm((x) => {
                                    const chips = x.heroExtras.chips.filter((_, i) => i !== idx);
                                    return {
                                      ...x,
                                      heroExtras: { ...x.heroExtras, chips: chips.length ? chips : [""] },
                                    };
                                  })
                                }
                                className="rounded-2xl border border-neutral-200 px-3 text-xs hover:bg-neutral-50"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => ({
                                ...x,
                                heroExtras: { ...x.heroExtras, chips: [...x.heroExtras.chips, ""] },
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add chip
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Hero note (HTML)</label>
                        <textarea
                          value={aboutForm.heroExtras.noteHtml}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              heroExtras: { ...x.heroExtras, noteHtml: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Info cards</label>
                        <div className="mt-2 space-y-4">
                          {aboutForm.heroExtras.infoCards.map((card, idx) => (
                            <div key={`hero-info-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3">
                                <input
                                  value={card.title}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const infoCards = [...x.heroExtras.infoCards];
                                      infoCards[idx] = { ...infoCards[idx], title: e.target.value };
                                      return { ...x, heroExtras: { ...x.heroExtras, infoCards } };
                                    })
                                  }
                                  className="w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Card title"
                                />
                                <textarea
                                  value={card.bodyHtml}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const infoCards = [...x.heroExtras.infoCards];
                                      infoCards[idx] = { ...infoCards[idx], bodyHtml: e.target.value };
                                      return { ...x, heroExtras: { ...x.heroExtras, infoCards } };
                                    })
                                  }
                                  className="w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  rows={3}
                                  placeholder="Card body (HTML allowed)"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAboutForm((x) => {
                                      const infoCards = x.heroExtras.infoCards.filter((_, i) => i !== idx);
                                      return {
                                        ...x,
                                        heroExtras: {
                                          ...x.heroExtras,
                                          infoCards: infoCards.length ? infoCards : [{ title: "", bodyHtml: "" }],
                                        },
                                      };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  Remove card
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => ({
                                ...x,
                                heroExtras: {
                                  ...x.heroExtras,
                                  infoCards: [...x.heroExtras.infoCards, { title: "", bodyHtml: "" }],
                                },
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add info card
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Stats</p>
                    <div className="mt-4 space-y-3">
                      {aboutForm.stats.map((stat, idx) => (
                        <div key={`stat-${idx}`} className="grid gap-3 sm:grid-cols-2">
                          <input
                            value={stat.label}
                            onChange={(e) =>
                              setAboutForm((x) => {
                                const stats = [...x.stats];
                                stats[idx] = { ...stats[idx], label: e.target.value };
                                return { ...x, stats };
                              })
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                            placeholder="Label"
                          />
                          <input
                            value={stat.value}
                            onChange={(e) =>
                              setAboutForm((x) => {
                                const stats = [...x.stats];
                                stats[idx] = { ...stats[idx], value: e.target.value };
                                return { ...x, stats };
                              })
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                            placeholder="Value"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => {
                                const stats = x.stats.filter((_, i) => i !== idx);
                                return { ...x, stats: stats.length ? stats : [{ label: "", value: "" }] };
                              })
                            }
                            className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50 sm:col-span-2"
                          >
                            Remove stat
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setAboutForm((x) => ({ ...x, stats: [...x.stats, { label: "", value: "" }] }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                      >
                        Add stat
                      </button>
                    </div>
                  </div>
                ) : null}

                {isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Story section</p>
                    <div className="mt-5 grid gap-4">
                      <input
                        value={aboutForm.story.title}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, story: { ...x.story, title: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        placeholder="Title"
                      />
                      <textarea
                        value={aboutForm.story.intro}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, story: { ...x.story, intro: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                        placeholder="Intro"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={aboutForm.story.primaryLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              story: { ...x.story, primaryLabel: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Primary button label"
                        />
                        <input
                          value={aboutForm.story.primaryHref}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              story: { ...x.story, primaryHref: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Primary button link"
                        />
                        <input
                          value={aboutForm.story.secondaryLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              story: { ...x.story, secondaryLabel: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Secondary button label"
                        />
                        <input
                          value={aboutForm.story.secondaryHref}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              story: { ...x.story, secondaryHref: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Secondary button link"
                        />
                      </div>
                      <textarea
                        value={aboutForm.story.bodyHtml}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, story: { ...x.story, bodyHtml: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={6}
                        placeholder="Body HTML"
                      />
                    </div>
                  </div>
                ) : null}

                {isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Values section</p>
                    <div className="mt-5 grid gap-4">
                      <input
                        value={aboutForm.values.title}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, values: { ...x.values, title: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        placeholder="Title"
                      />
                      <textarea
                        value={aboutForm.values.intro}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, values: { ...x.values, intro: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                        placeholder="Intro"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={aboutForm.values.assistTitle}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              values: { ...x.values, assistTitle: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Assist title"
                        />
                        <input
                          value={aboutForm.values.assistCtaLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              values: { ...x.values, assistCtaLabel: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Assist button label"
                        />
                        <input
                          value={aboutForm.values.assistCtaHref}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              values: { ...x.values, assistCtaHref: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Assist button link"
                        />
                      </div>
                      <textarea
                        value={aboutForm.values.assistDesc}
                        onChange={(e) =>
                          setAboutForm((x) => ({
                            ...x,
                            values: { ...x.values, assistDesc: e.target.value },
                          }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={2}
                        placeholder="Assist description"
                      />
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Value cards</label>
                        <div className="mt-2 space-y-3">
                          {aboutForm.values.items.map((item, idx) => (
                            <div key={`value-item-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3">
                                <input
                                  value={item.title}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const items = [...x.values.items];
                                      items[idx] = { ...items[idx], title: e.target.value };
                                      return { ...x, values: { ...x.values, items } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Title"
                                />
                                <textarea
                                  value={item.desc}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const items = [...x.values.items];
                                      items[idx] = { ...items[idx], desc: e.target.value };
                                      return { ...x, values: { ...x.values, items } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  rows={3}
                                  placeholder="Description"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAboutForm((x) => {
                                      const items = x.values.items.filter((_, i) => i !== idx);
                                      return {
                                        ...x,
                                        values: { ...x.values, items: items.length ? items : [{ title: "", desc: "" }] },
                                      };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  Remove card
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => ({
                                ...x,
                                values: { ...x.values, items: [...x.values.items, { title: "", desc: "" }] },
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add value card
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Verification section</p>
                    <div className="mt-5 grid gap-4">
                      <input
                        value={aboutForm.verification.title}
                        onChange={(e) =>
                          setAboutForm((x) => ({
                            ...x,
                            verification: { ...x.verification, title: e.target.value },
                          }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        placeholder="Title"
                      />
                      <textarea
                        value={aboutForm.verification.intro}
                        onChange={(e) =>
                          setAboutForm((x) => ({
                            ...x,
                            verification: { ...x.verification, intro: e.target.value },
                          }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={2}
                        placeholder="Intro"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={aboutForm.verification.supportLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              verification: { ...x.verification, supportLabel: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Support link label"
                        />
                        <input
                          value={aboutForm.verification.supportHref}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              verification: { ...x.verification, supportHref: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Support link href"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Steps</label>
                        <div className="mt-2 space-y-3">
                          {aboutForm.verification.steps.map((step, idx) => (
                            <div key={`verification-step-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3">
                                <input
                                  value={step.n}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const steps = [...x.verification.steps];
                                      steps[idx] = { ...steps[idx], n: e.target.value };
                                      return { ...x, verification: { ...x.verification, steps } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Step number"
                                />
                                <input
                                  value={step.title}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const steps = [...x.verification.steps];
                                      steps[idx] = { ...steps[idx], title: e.target.value };
                                      return { ...x, verification: { ...x.verification, steps } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Step title"
                                />
                                <textarea
                                  value={step.desc}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const steps = [...x.verification.steps];
                                      steps[idx] = { ...steps[idx], desc: e.target.value };
                                      return { ...x, verification: { ...x.verification, steps } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  rows={2}
                                  placeholder="Step description"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAboutForm((x) => {
                                      const steps = x.verification.steps.filter((_, i) => i !== idx);
                                      return {
                                        ...x,
                                        verification: {
                                          ...x.verification,
                                          steps: steps.length ? steps : [{ n: "", title: "", desc: "" }],
                                        },
                                      };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  Remove step
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => ({
                                ...x,
                                verification: {
                                  ...x.verification,
                                  steps: [...x.verification.steps, { n: "", title: "", desc: "" }],
                                },
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add step
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={aboutForm.verification.moreHtml}
                        onChange={(e) =>
                          setAboutForm((x) => ({
                            ...x,
                            verification: { ...x.verification, moreHtml: e.target.value },
                          }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={4}
                        placeholder="More details (HTML)"
                      />
                    </div>
                  </div>
                ) : null}

                {isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Support section</p>
                    <div className="mt-5 grid gap-4">
                      <input
                        value={aboutForm.support.title}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, support: { ...x.support, title: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        placeholder="Title"
                      />
                      <textarea
                        value={aboutForm.support.intro}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, support: { ...x.support, intro: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={2}
                        placeholder="Intro"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={aboutForm.support.linkLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({ ...x, support: { ...x.support, linkLabel: e.target.value } }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Top link label"
                        />
                        <input
                          value={aboutForm.support.linkHref}
                          onChange={(e) =>
                            setAboutForm((x) => ({ ...x, support: { ...x.support, linkHref: e.target.value } }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Top link href"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Support links</label>
                        <div className="mt-2 space-y-3">
                          {aboutForm.support.links.map((link, idx) => (
                            <div key={`support-link-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3">
                                <input
                                  value={link.title}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const links = [...x.support.links];
                                      links[idx] = { ...links[idx], title: e.target.value };
                                      return { ...x, support: { ...x.support, links } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Title"
                                />
                                <input
                                  value={link.href}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const links = [...x.support.links];
                                      links[idx] = { ...links[idx], href: e.target.value };
                                      return { ...x, support: { ...x.support, links } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Href"
                                />
                                <textarea
                                  value={link.desc}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const links = [...x.support.links];
                                      links[idx] = { ...links[idx], desc: e.target.value };
                                      return { ...x, support: { ...x.support, links } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  rows={2}
                                  placeholder="Description"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAboutForm((x) => {
                                      const links = x.support.links.filter((_, i) => i !== idx);
                                      return {
                                        ...x,
                                        support: {
                                          ...x.support,
                                          links: links.length ? links : [{ href: "", title: "", desc: "" }],
                                        },
                                      };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  Remove link
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => ({
                                ...x,
                                support: {
                                  ...x.support,
                                  links: [...x.support.links, { href: "", title: "", desc: "" }],
                                },
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add support link
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Support cards</label>
                        <div className="mt-2 space-y-3">
                          {aboutForm.support.cards.map((card, idx) => (
                            <div key={`support-card-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3">
                                <input
                                  value={card.title}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const cards = [...x.support.cards];
                                      cards[idx] = { ...cards[idx], title: e.target.value };
                                      return { ...x, support: { ...x.support, cards } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Title"
                                />
                                <textarea
                                  value={card.bodyHtml}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const cards = [...x.support.cards];
                                      cards[idx] = { ...cards[idx], bodyHtml: e.target.value };
                                      return { ...x, support: { ...x.support, cards } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  rows={3}
                                  placeholder="Body HTML"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAboutForm((x) => {
                                      const cards = x.support.cards.filter((_, i) => i !== idx);
                                      return {
                                        ...x,
                                        support: {
                                          ...x.support,
                                          cards: cards.length ? cards : [{ title: "", bodyHtml: "" }],
                                        },
                                      };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  Remove card
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => ({
                                ...x,
                                support: {
                                  ...x.support,
                                  cards: [...x.support.cards, { title: "", bodyHtml: "" }],
                                },
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add support card
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">FAQ section</p>
                    <div className="mt-5 grid gap-4">
                      <input
                        value={aboutForm.faq.title}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, faq: { ...x.faq, title: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        placeholder="Title"
                      />
                      <textarea
                        value={aboutForm.faq.intro}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, faq: { ...x.faq, intro: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={2}
                        placeholder="Intro"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={aboutForm.faq.linkLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({ ...x, faq: { ...x.faq, linkLabel: e.target.value } }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="FAQ link label"
                        />
                        <input
                          value={aboutForm.faq.linkHref}
                          onChange={(e) =>
                            setAboutForm((x) => ({ ...x, faq: { ...x.faq, linkHref: e.target.value } }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="FAQ link href"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">FAQ items</label>
                        <div className="mt-2 space-y-3">
                          {aboutForm.faq.items.map((item, idx) => (
                            <div key={`faq-item-${idx}`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3">
                                <input
                                  value={item.q}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const items = [...x.faq.items];
                                      items[idx] = { ...items[idx], q: e.target.value };
                                      return { ...x, faq: { ...x.faq, items } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Question"
                                />
                                <textarea
                                  value={item.a}
                                  onChange={(e) =>
                                    setAboutForm((x) => {
                                      const items = [...x.faq.items];
                                      items[idx] = { ...items[idx], a: e.target.value };
                                      return { ...x, faq: { ...x.faq, items } };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                  rows={2}
                                  placeholder="Answer"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAboutForm((x) => {
                                      const items = x.faq.items.filter((_, i) => i !== idx);
                                      return {
                                        ...x,
                                        faq: { ...x.faq, items: items.length ? items : [{ q: "", a: "" }] },
                                      };
                                    })
                                  }
                                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  Remove FAQ
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => ({
                                ...x,
                                faq: { ...x.faq, items: [...x.faq.items, { q: "", a: "" }] },
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add FAQ
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={aboutForm.faq.footerHtml}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, faq: { ...x.faq, footerHtml: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                        placeholder="Footer HTML"
                      />
                    </div>
                  </div>
                ) : null}

                {isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Final CTA section</p>
                    <div className="mt-5 grid gap-4">
                      <input
                        value={aboutForm.finalCta.title}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, finalCta: { ...x.finalCta, title: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        placeholder="Title"
                      />
                      <textarea
                        value={aboutForm.finalCta.desc}
                        onChange={(e) =>
                          setAboutForm((x) => ({ ...x, finalCta: { ...x.finalCta, desc: e.target.value } }))
                        }
                        className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={2}
                        placeholder="Description"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={aboutForm.finalCta.primaryLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              finalCta: { ...x.finalCta, primaryLabel: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Primary button label"
                        />
                        <input
                          value={aboutForm.finalCta.primaryHref}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              finalCta: { ...x.finalCta, primaryHref: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Primary button link"
                        />
                        <input
                          value={aboutForm.finalCta.secondaryLabel}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              finalCta: { ...x.finalCta, secondaryLabel: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Secondary button label"
                        />
                        <input
                          value={aboutForm.finalCta.secondaryHref}
                          onChange={(e) =>
                            setAboutForm((x) => ({
                              ...x,
                              finalCta: { ...x.finalCta, secondaryHref: e.target.value },
                            }))
                          }
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                          placeholder="Secondary button link"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Footer links</label>
                        <div className="mt-2 space-y-3">
                          {aboutForm.finalCta.footerLinks.map((link, idx) => (
                            <div key={`footer-link-${idx}`} className="grid gap-3 sm:grid-cols-2">
                              <input
                                value={link.label}
                                onChange={(e) =>
                                  setAboutForm((x) => {
                                    const footerLinks = [...x.finalCta.footerLinks];
                                    footerLinks[idx] = { ...footerLinks[idx], label: e.target.value };
                                    return { ...x, finalCta: { ...x.finalCta, footerLinks } };
                                  })
                                }
                                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                placeholder="Label"
                              />
                              <input
                                value={link.href}
                                onChange={(e) =>
                                  setAboutForm((x) => {
                                    const footerLinks = [...x.finalCta.footerLinks];
                                    footerLinks[idx] = { ...footerLinks[idx], href: e.target.value };
                                    return { ...x, finalCta: { ...x.finalCta, footerLinks } };
                                  })
                                }
                                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                                placeholder="Href"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setAboutForm((x) => {
                                    const footerLinks = x.finalCta.footerLinks.filter((_, i) => i !== idx);
                                    return {
                                      ...x,
                                      finalCta: {
                                        ...x.finalCta,
                                        footerLinks: footerLinks.length ? footerLinks : [{ label: "", href: "" }],
                                      },
                                    };
                                  })
                                }
                                className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50 sm:col-span-2"
                              >
                                Remove link
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm((x) => ({
                                ...x,
                                finalCta: {
                                  ...x.finalCta,
                                  footerLinks: [...x.finalCta.footerLinks, { label: "", href: "" }],
                                },
                              }))
                            }
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                          >
                            Add footer link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Deals summary</p>
                  <div className="mt-5 grid gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Short description</label>
                      <textarea
                        value={form.shortDescription}
                        onChange={(e) => setForm((x) => ({ ...x, shortDescription: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                      />
                    </div>
                    <div>
                      <ImageUploader
                        title="Feature image"
                        hint="Upload a single image for the deals hero."
                        value={
                          form.featureImage
                            ? [{ url: form.featureImage, alt: form.featureImageAlt }]
                            : []
                        }
                        onChange={(imgs) =>
                          setForm((x) => ({
                            ...x,
                            featureImage: imgs[0]?.url || "",
                            featureImageAlt: imgs[0]?.alt || "",
                          }))
                        }
                        max={1}
                        kind="product"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Long description</p>
                  <div className="mt-3">
                    <RichEditor
                      value={form.contentHtml}
                      onChange={(html) => setForm((x) => ({ ...x, contentHtml: html }))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="lg:col-span-5 space-y-6">
            {form.slug !== "deals" ? (
              <>
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">{isAbout ? "Hero image" : "Hero (right card)"}</p>
                  <div className="mt-5 grid gap-4">
                    <div>
                      <ImageUploader
                        title="Hero image"
                        hint="Upload a single image for the right-side hero card."
                        value={form.heroImage ? [{ url: form.heroImage, alt: form.heroImageAlt }] : []}
                        onChange={(imgs) =>
                          setForm((x) => ({
                            ...x,
                            heroImage: imgs[0]?.url || "",
                            heroImageAlt: imgs[0]?.alt || "",
                          }))
                        }
                        max={1}
                        kind="product"
                      />
                    </div>
                    {!isAbout ? (
                      <>
                        <div>
                          <label className="text-xs font-medium text-neutral-700">Card title</label>
                          <input
                            value={form.heroCardTitle}
                            onChange={(e) => setForm((x) => ({ ...x, heroCardTitle: e.target.value }))}
                            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-700">Card subtitle</label>
                          <textarea
                            value={form.heroCardSubtitle}
                            onChange={(e) => setForm((x) => ({ ...x, heroCardSubtitle: e.target.value }))}
                            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            rows={3}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-medium text-neutral-700">Card primary label</label>
                            <input
                              value={form.heroCardPrimaryLabel}
                              onChange={(e) => setForm((x) => ({ ...x, heroCardPrimaryLabel: e.target.value }))}
                              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-neutral-700">Card primary link</label>
                            <input
                              value={form.heroCardPrimaryHref}
                              onChange={(e) => setForm((x) => ({ ...x, heroCardPrimaryHref: e.target.value }))}
                              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-neutral-700">Card secondary label</label>
                            <input
                              value={form.heroCardSecondaryLabel}
                              onChange={(e) => setForm((x) => ({ ...x, heroCardSecondaryLabel: e.target.value }))}
                              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-neutral-700">Card secondary link</label>
                            <input
                              value={form.heroCardSecondaryHref}
                              onChange={(e) => setForm((x) => ({ ...x, heroCardSecondaryHref: e.target.value }))}
                              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                {!isAbout ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold">Page content (optional)</p>
                    <div className="mt-3">
                      <RichEditor
                        value={form.contentHtml}
                        onChange={(html) => setForm((x) => ({ ...x, contentHtml: html }))}
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
