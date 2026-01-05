"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import { Fetch } from "@/lib/fetch";
import type { AdminImage } from "@/types/adminProduct";

export default function AdminSettingsPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [secMsg, setSecMsg] = useState<string | null>(null);
  const [brandingMsg, setBrandingMsg] = useState<string | null>(null);
  const [brandingLoading, setBrandingLoading] = useState(true);
  const [brandingSaving, setBrandingSaving] = useState(false);

  // Branding
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [logoImages, setLogoImages] = useState<AdminImage[]>([]);
  const [iconImages, setIconImages] = useState<AdminImage[]>([]);

  // Store
  const [storeName, setStoreName] = useState("LuxStore");
  const [storeDomain, setStoreDomain] = useState("luxstore.pk");

  // Shipping
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("PKR 10,000");
  const [defaultShippingFee, setDefaultShippingFee] = useState("PKR 500");
  const [returnsDays, setReturnsDays] = useState(7);

  // Payments (Pakistan)
  const [codEnabled, setCodEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [gatewayName, setGatewayName] = useState("PayFast / Stripe / JazzCash (placeholder)");
  const [cryptoEnabled, setCryptoEnabled] = useState(false);

  // SEO
  const [siteTitle, setSiteTitle] = useState("LuxStore Pakistan | Luxury Watches & Accessories");
  const [siteMetaDesc, setSiteMetaDesc] = useState("Buy luxury watches in Pakistan with secure checkout, authenticity checks, and fast delivery.");
  const [indexable, setIndexable] = useState(true);

  // Admin security
  const [currentEmail, setCurrentEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setBrandingLoading(true);
      setBrandingMsg(null);
      const res = await Fetch("/api/admin/site-settings", { auth: true, cache: "no-store" });
      if (!alive) return;
      if (!res.ok) {
        setBrandingMsg(res.error || "Failed to load branding settings.");
        setBrandingLoading(false);
        return;
      }
      const data: any = res.data || {};
      setSiteName(data.siteName ?? "");
      setSiteUrl(data.siteUrl ?? "");
      setLogoImages(data.logoUrl ? [{ url: data.logoUrl, alt: data.logoAlt ?? "" }] : []);
      setIconImages(data.siteIconUrl ? [{ url: data.siteIconUrl, alt: data.siteIconAlt ?? "" }] : []);
      setBrandingLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await Fetch("/api/admin/store-settings", { auth: true, cache: "no-store" });
      if (!alive) return;
      if (!res.ok) {
        setMsg(res.error || "Failed to load settings.");
        return;
      }
      const data: any = res.data || {};
      setStoreName(data.storeName ?? storeName);
      setStoreDomain(data.storeDomain ?? storeDomain);
      setFreeShippingThreshold(data.freeShippingThreshold ?? freeShippingThreshold);
      setDefaultShippingFee(data.defaultShippingFee ?? defaultShippingFee);
      setReturnsDays(data.returnsDays ?? returnsDays);
      setCodEnabled(typeof data.codEnabled === "boolean" ? data.codEnabled : codEnabled);
      setCardEnabled(typeof data.cardEnabled === "boolean" ? data.cardEnabled : cardEnabled);
      setGatewayName(data.gatewayName ?? gatewayName);
      setCryptoEnabled(typeof data.cryptoEnabled === "boolean" ? data.cryptoEnabled : cryptoEnabled);
      setSiteTitle(data.siteTitle ?? siteTitle);
      setSiteMetaDesc(data.siteMetaDesc ?? siteMetaDesc);
      setIndexable(typeof data.indexable === "boolean" ? data.indexable : indexable);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function save() {
    setMsg(null);
    try {
      const payload = {
        storeName,
        storeDomain,
        freeShippingThreshold,
        defaultShippingFee,
        returnsDays,
        codEnabled,
        cardEnabled,
        gatewayName,
        cryptoEnabled,
        siteTitle,
        siteMetaDesc,
        indexable,
      };

      const res = await Fetch("/api/admin/store-settings", {
        method: "PUT",
        auth: true,
        data: payload,
      });

      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);
      setMsg("Settings updated.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save.");
    }
  }

  async function saveBranding() {
    setBrandingSaving(true);
    setBrandingMsg(null);
    try {
      const payload = {
        siteName: siteName.trim() || null,
        siteUrl: siteUrl.trim() || null,
        logoUrl: logoImages[0]?.url || null,
        logoAlt: logoImages[0]?.alt || null,
        siteIconUrl: iconImages[0]?.url || null,
        siteIconAlt: iconImages[0]?.alt || null,
      };

      const res = await Fetch("/api/admin/site-settings", {
        method: "PUT",
        auth: true,
        data: payload,
      });

      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);
      setBrandingMsg("Branding updated.");
    } catch (e: any) {
      setBrandingMsg(e?.message || "Failed to update branding.");
    } finally {
      setBrandingSaving(false);
    }
  }

  async function saveSecurity() {
    setSecMsg(null);
    if (!currentEmail.trim()) return setSecMsg("Current email required.");

    try {
      const payload = {
        currentEmail,
        name: adminName || undefined,
        newEmail: newEmail || undefined,
        newPassword: newPassword || undefined,
      };

      const res = await Fetch("/api/admin/security", {
        method: "PUT",
        auth: true,
        data: payload,
      });

      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);

      setSecMsg("Admin security updated.");
      setNewPassword("");
    } catch (e: any) {
      setSecMsg(e?.message || "Failed to update admin security.");
    }
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Settings" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Store settings</p>
            <p className="mt-1 text-xs text-neutral-500">Configure store, payments, shipping, and SEO defaults.</p>
          </div>

          <button
            onClick={save}
            className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Save settings
          </button>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Branding</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Logo, favicon, and public site identity values.
                  </p>
                </div>
                <button
                  onClick={saveBranding}
                  disabled={brandingSaving}
                  className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {brandingSaving ? "Saving..." : "Save branding"}
                </button>
              </div>

              {brandingMsg ? (
                <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  {brandingMsg}
                </div>
              ) : null}

              {brandingLoading ? (
                <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  Loading branding...
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Site name</label>
                  <input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="LuxStore"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Site URL</label>
                  <input
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="https://luxstore.pk"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-6">
                <ImageUploader
                  title="Website logo"
                  hint="Recommended: transparent PNG or SVG, 512x512+."
                  value={logoImages}
                  onChange={setLogoImages}
                  max={1}
                  kind="branding"
                />
                <ImageUploader
                  title="Site icon (favicon)"
                  hint="Recommended: square icon, 512x512 PNG."
                  value={iconImages}
                  onChange={setIconImages}
                  max={1}
                  kind="branding"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Store</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Store name</label>
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Domain</label>
                  <input
                    value={storeDomain}
                    onChange={(e) => setStoreDomain(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Shipping & returns</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Free shipping threshold</label>
                  <input
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Default shipping fee</label>
                  <input
                    value={defaultShippingFee}
                    onChange={(e) => setDefaultShippingFee(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Return days</label>
                  <input
                    value={String(returnsDays)}
                    onChange={(e) => setReturnsDays(Math.max(0, Number(e.target.value) || 0))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO defaults</p>

              <div className="mt-5">
                <label className="text-xs font-medium text-neutral-700">Site title</label>
                <input
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Site meta description</label>
                <textarea
                  value={siteMetaDesc}
                  onChange={(e) => setSiteMetaDesc(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3">
                <p className="text-sm text-neutral-700">Indexable</p>
                <button
                  type="button"
                  onClick={() => setIndexable((v) => !v)}
                  className={[
                    "h-8 w-14 rounded-full border transition",
                    indexable ? "border-neutral-900 bg-neutral-900" : "border-neutral-200 bg-neutral-100",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block h-7 w-7 rounded-full bg-white transition",
                      indexable ? "translate-x-6" : "translate-x-0",
                    ].join(" ")}
                  />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Admin security</p>
              <p className="mt-1 text-xs text-neutral-500">Update admin name, email, or password.</p>

              {secMsg ? (
                <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  {secMsg}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Current email</label>
                  <input
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="admin@yourstore.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Admin name</label>
                  <input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Admin"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">New email (optional)</label>
                  <input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="new-admin@yourstore.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">New password (optional)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="********"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={saveSecurity}
                  className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Update admin security
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Payments</p>

              <div className="mt-5 space-y-3">
                {[
                  { label: "Cash on Delivery (COD)", value: codEnabled, set: setCodEnabled },
                  { label: "Card / Online Payment", value: cardEnabled, set: setCardEnabled },
                  { label: "Crypto Payments", value: cryptoEnabled, set: setCryptoEnabled },
                ].map((x) => (
                  <div key={x.label} className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3">
                    <p className="text-sm text-neutral-700">{x.label}</p>
                    <button
                      type="button"
                      onClick={() => x.set(!x.value)}
                      className={[
                        "h-8 w-14 rounded-full border transition",
                        x.value ? "border-neutral-900 bg-neutral-900" : "border-neutral-200 bg-neutral-100",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "block h-7 w-7 rounded-full bg-white transition",
                          x.value ? "translate-x-6" : "translate-x-0",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Gateway name / notes</label>
                <textarea
                  value={gatewayName}
                  onChange={(e) => setGatewayName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs text-neutral-600">
                  Pakistan launch tip: COD improves conversion, but confirm/call verification reduces returns.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Dropshipping</p>
              <p className="mt-2 text-sm text-neutral-600">
                Products with <span className="font-semibold">isDropship=true</span> should attach vendor + lead time in backend.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  { t: "Vendor SLA", d: "Expected delivery times per vendor" },
                  { t: "Stock sync", d: "Pull stock updates daily/hourly" },
                  { t: "Returns", d: "Vendor return policy mapping" },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs font-semibold">{x.t}</p>
                    <p className="mt-1 text-xs text-neutral-600">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
