"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  Code2,
  CreditCard,
  FileText,
  Globe2,
  Headphones,
  LockKeyhole,
  Megaphone,
  Paintbrush,
  Palette,
  Plus,
  Power,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import { AdminCard, AdminField, AdminPageHeader, AdminSection } from "@/components/admin/ui";
import { Fetch } from "@/lib/fetch";
import {
  DEFAULT_CART_SETTINGS,
  parseCartSettings,
  serializeCartSettings,
  type CartSettings,
} from "@/lib/cartSettings";
import {
  DEFAULT_CATALOG_SETTINGS,
  itemsToText,
  listToText,
  parseCatalogSettings,
  serializeCatalogSettings,
  textToItems,
  textToList,
  type CatalogTemplateSettings,
} from "@/lib/catalogSettings";
import {
  DEFAULT_CHECKOUT_SETTINGS,
  listToTextareaValue,
  parseCheckoutSettings,
  serializeCheckoutSettings,
  textareaValueToList,
  type CheckoutSettings,
  type EmailMode,
} from "@/lib/checkoutSettings";
import {
  DEFAULT_FOOTER_COPYRIGHT,
  DEFAULT_FOOTER_NEWSLETTER,
  DEFAULT_FOOTER_SOCIAL_LINKS,
  DEFAULT_FOOTER_TRUST_ITEMS,
  DEFAULT_FOOTER_COLUMNS,
  parseFooterColumns,
  parseFooterSocialLinks,
  parseFooterTrustItems,
  serializeFooterColumns,
  serializeFooterSocialLinks,
  serializeFooterTrustItems,
  type FooterColumn,
  type FooterSocialLink,
  type FooterTrustItem,
} from "@/lib/footerSettings";
import {
  DEFAULT_GLOBAL_COPY,
  parseGlobalCopy,
  serializeGlobalCopy,
  type GlobalCopy,
} from "@/lib/globalCopy";
import {
  DEFAULT_HEADER_MENU_ITEMS,
  DEFAULT_HEADER_SEARCH_PLACEHOLDER,
  parseHeaderMenuItems,
  serializeHeaderMenuItems,
  type HeaderMenuItem,
} from "@/lib/headerSettings";
import {
  getCustomScriptWarnings,
  getTrackingStatus,
  isValidGoogleTagManagerId,
  isValidMicrosoftClarityId,
  validateMetaPixelIds,
} from "@/lib/trackingSettings";
import {
  DEFAULT_THEME_SETTINGS,
  getThemeWarnings,
  parseThemeSettings,
  serializeThemeSettings,
  type ThemeFontChoice,
  type ThemeSettings,
} from "@/lib/themeSettings";
import type { AdminImage } from "@/types/adminProduct";

type SettingsTabId =
  | "branding"
  | "design"
  | "site"
  | "headerFooter"
  | "globalCopy"
  | "contact"
  | "shopping"
  | "checkout"
  | "shipping"
  | "payments"
  | "seo"
  | "tracking"
  | "customCode"
  | "security";

type SettingsTab = {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

type SiteSettingsData = {
  siteName?: string | null;
  siteUrl?: string | null;
  logoUrl?: string | null;
  logoAlt?: string | null;
  siteIconUrl?: string | null;
  siteIconAlt?: string | null;
  siteFooterText?: string | null;
  metaPixelEnabled?: boolean | null;
  metaPixelIds?: string | null;
  facebookDomainVerification?: string | null;
  googleSiteVerification?: string | null;
  googleTagManagerEnabled?: boolean | null;
  googleTagManagerId?: string | null;
  microsoftClarityEnabled?: boolean | null;
  microsoftClarityId?: string | null;
  customHeadScriptsEnabled?: boolean | null;
  customHeadScripts?: string | null;
  customBodyStartScriptsEnabled?: boolean | null;
  customBodyStartScripts?: string | null;
  customBodyEndScriptsEnabled?: boolean | null;
  customBodyEndScripts?: string | null;
  headerMenuItems?: string | null;
  headerSearchPlaceholder?: string | null;
  headerAnnouncementEnabled?: boolean;
  headerAnnouncementText?: string | null;
  headerAnnouncementHref?: string | null;
  headerShowSearch?: boolean;
  headerShowAccount?: boolean;
  headerShowCart?: boolean;
  headerShowSupportLinks?: boolean;
  footerCopyright?: string | null;
  footerColumns?: string | null;
  footerNewsletterEnabled?: boolean;
  footerNewsletterEyebrow?: string | null;
  footerNewsletterTitle?: string | null;
  footerNewsletterSubtitle?: string | null;
  footerNewsletterConsentText?: string | null;
  footerTrustItems?: string | null;
  footerSocialLinks?: string | null;
  globalCopy?: string | null;
  checkoutSettings?: string | null;
  cartSettings?: string | null;
  catalogSettings?: string | null;
  themeSettings?: string | null;
};

type StoreSettingsData = {
  storeName?: string | null;
  storeDomain?: string | null;
  freeShippingThreshold?: string | null;
  defaultShippingFee?: string | null;
  returnsDays?: number | null;
  codEnabled?: boolean;
  cardEnabled?: boolean;
  gatewayName?: string | null;
  cryptoEnabled?: boolean;
  siteTitle?: string | null;
  siteMetaDesc?: string | null;
  indexable?: boolean;
};

const SETTINGS_TABS: SettingsTab[] = [
  {
    id: "branding",
    label: "Branding",
    description: "Logo, icon, and public brand identity.",
    icon: Palette,
  },
  {
    id: "design",
    label: "Design & Theme",
    description: "Colors, radius, typography, and frontend theme preview.",
    icon: Paintbrush,
  },
  {
    id: "site",
    label: "Site Settings",
    description: "Website URL, domain, and store identity.",
    icon: Globe2,
  },
  {
    id: "headerFooter",
    label: "Header & Footer",
    description: "Header menus, announcement, visibility, and footer text.",
    icon: Megaphone,
  },
  {
    id: "globalCopy",
    label: "Global Copy",
    description: "Reusable labels, buttons, empty states, and trust text.",
    icon: FileText,
  },
  {
    id: "contact",
    label: "Contact & Support",
    description: "Support details managed in one focused area.",
    icon: Headphones,
  },
  {
    id: "shopping",
    label: "Shopping / Store",
    description: "Catalog-facing store defaults.",
    icon: ShoppingBag,
  },
  {
    id: "checkout",
    label: "Checkout",
    description: "COD-first checkout and order completion defaults.",
    icon: BadgeCheck,
  },
  {
    id: "shipping",
    label: "Shipping",
    description: "Delivery fee, free shipping, and return windows.",
    icon: Truck,
  },
  {
    id: "payments",
    label: "Payments",
    description: "COD and payment method availability.",
    icon: CreditCard,
  },
  {
    id: "seo",
    label: "SEO",
    description: "Default search metadata and index controls.",
    icon: Search,
  },
  {
    id: "tracking",
    label: "Tracking & Integrations",
    description: "Meta Pixel, Google, Clarity, and verification IDs.",
    icon: Boxes,
  },
  {
    id: "customCode",
    label: "Custom Code",
    description: "Head/body scripts with separated placements.",
    icon: Code2,
  },
  {
    id: "security",
    label: "Security",
    description: "Admin email, name, and password controls.",
    icon: LockKeyhole,
  },
];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function deriveDomainFromSiteUrl(siteUrl: string) {
  const value = siteUrl.trim();
  if (!value) return "";

  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(withProtocol).hostname.replace(/^www\./i, "");
  } catch {
    return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0] || "";
  }
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        {description ? <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p> : null}
      </div>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={[
          "h-8 w-14 shrink-0 rounded-full border transition",
          checked ? "border-neutral-900 bg-neutral-900" : "border-neutral-200 bg-neutral-100",
        ].join(" ")}
      >
        <span
          className={[
            "block h-7 w-7 rounded-full bg-white transition",
            checked ? "translate-x-6" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function ThemeColorField({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) {
  return (
    <AdminField label={label} description={description}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
          aria-label={label}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 font-mono text-sm uppercase outline-none focus:border-neutral-900"
          placeholder="#111111"
        />
      </div>
    </AdminField>
  );
}

function Message({ children }: { children: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
    >
      {children}
    </Link>
  );
}

function CopyInput({
  label,
  value,
  onChange,
  description,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  multiline?: boolean;
}) {
  return (
    <AdminField label={label} description={description}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          rows={3}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
        />
      )}
    </AdminField>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("branding");
  const [storeMsg, setStoreMsg] = useState<string | null>(null);
  const [siteMsg, setSiteMsg] = useState<string | null>(null);
  const [securityMsg, setSecurityMsg] = useState<string | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(true);
  const [siteSaving, setSiteSaving] = useState(false);
  const [storeSaving, setStoreSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  // Site settings
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [siteFooterText, setSiteFooterText] = useState("");
  const [logoImages, setLogoImages] = useState<AdminImage[]>([]);
  const [iconImages, setIconImages] = useState<AdminImage[]>([]);
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(true);
  const [metaPixelIds, setMetaPixelIds] = useState("");
  const [facebookDomainVerification, setFacebookDomainVerification] = useState("");
  const [googleSiteVerification, setGoogleSiteVerification] = useState("");
  const [googleTagManagerEnabled, setGoogleTagManagerEnabled] = useState(true);
  const [googleTagManagerId, setGoogleTagManagerId] = useState("");
  const [microsoftClarityEnabled, setMicrosoftClarityEnabled] = useState(true);
  const [microsoftClarityId, setMicrosoftClarityId] = useState("");
  const [customHeadScriptsEnabled, setCustomHeadScriptsEnabled] = useState(true);
  const [customHeadScripts, setCustomHeadScripts] = useState("");
  const [customBodyStartScriptsEnabled, setCustomBodyStartScriptsEnabled] = useState(true);
  const [customBodyStartScripts, setCustomBodyStartScripts] = useState("");
  const [customBodyEndScriptsEnabled, setCustomBodyEndScriptsEnabled] = useState(true);
  const [customBodyEndScripts, setCustomBodyEndScripts] = useState("");
  const [headerMenuItems, setHeaderMenuItems] =
    useState<HeaderMenuItem[]>(DEFAULT_HEADER_MENU_ITEMS);
  const [headerSearchPlaceholder, setHeaderSearchPlaceholder] = useState(
    DEFAULT_HEADER_SEARCH_PLACEHOLDER
  );
  const [headerAnnouncementEnabled, setHeaderAnnouncementEnabled] = useState(true);
  const [headerAnnouncementText, setHeaderAnnouncementText] = useState("");
  const [headerAnnouncementHref, setHeaderAnnouncementHref] = useState("");
  const [headerShowSearch, setHeaderShowSearch] = useState(true);
  const [headerShowAccount, setHeaderShowAccount] = useState(true);
  const [headerShowCart, setHeaderShowCart] = useState(true);
  const [headerShowSupportLinks, setHeaderShowSupportLinks] = useState(true);
  const [footerCopyright, setFooterCopyright] = useState(DEFAULT_FOOTER_COPYRIGHT);
  const [footerColumns, setFooterColumns] =
    useState<FooterColumn[]>(DEFAULT_FOOTER_COLUMNS);
  const [footerNewsletterEnabled, setFooterNewsletterEnabled] = useState(true);
  const [footerNewsletterEyebrow, setFooterNewsletterEyebrow] = useState(
    DEFAULT_FOOTER_NEWSLETTER.eyebrow
  );
  const [footerNewsletterTitle, setFooterNewsletterTitle] = useState(
    DEFAULT_FOOTER_NEWSLETTER.title
  );
  const [footerNewsletterSubtitle, setFooterNewsletterSubtitle] = useState(
    DEFAULT_FOOTER_NEWSLETTER.subtitle
  );
  const [footerNewsletterConsentText, setFooterNewsletterConsentText] = useState(
    DEFAULT_FOOTER_NEWSLETTER.consentText
  );
  const [footerTrustItems, setFooterTrustItems] =
    useState<FooterTrustItem[]>(DEFAULT_FOOTER_TRUST_ITEMS);
  const [footerSocialLinks, setFooterSocialLinks] =
    useState<FooterSocialLink[]>(DEFAULT_FOOTER_SOCIAL_LINKS);
  const [globalCopy, setGlobalCopy] = useState<GlobalCopy>(DEFAULT_GLOBAL_COPY);
  const [checkoutSettings, setCheckoutSettings] =
    useState<CheckoutSettings>(DEFAULT_CHECKOUT_SETTINGS);
  const [cartSettings, setCartSettings] = useState<CartSettings>(DEFAULT_CART_SETTINGS);
  const [catalogSettings, setCatalogSettings] =
    useState<CatalogTemplateSettings>(DEFAULT_CATALOG_SETTINGS);
  const [themeSettings, setThemeSettings] =
    useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);

  // Store settings
  const [storeName, setStoreName] = useState("Store");
  const [storeDomain, setStoreDomain] = useState("example.com");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("PKR 10,000");
  const [defaultShippingFee, setDefaultShippingFee] = useState("PKR 250");
  const [returnsDays, setReturnsDays] = useState(7);
  const [codEnabled, setCodEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [gatewayName, setGatewayName] = useState("PayFast / Stripe / JazzCash (placeholder)");
  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const [siteTitle, setSiteTitle] = useState("Online Store Pakistan");
  const [siteMetaDesc, setSiteMetaDesc] = useState(
    "Shop quality products in Pakistan with secure checkout and fast delivery."
  );
  const [indexable, setIndexable] = useState(true);

  // Admin security
  const [currentEmail, setCurrentEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const activeTabMeta = useMemo(
    () => SETTINGS_TABS.find((tab) => tab.id === activeTab) ?? SETTINGS_TABS[0],
    [activeTab]
  );
  const themeWarnings = useMemo(() => getThemeWarnings(themeSettings), [themeSettings]);
  const metaPixelValidation = useMemo(
    () => validateMetaPixelIds(metaPixelIds),
    [metaPixelIds]
  );
  const googleTagManagerValid = useMemo(
    () => !googleTagManagerId.trim() || isValidGoogleTagManagerId(googleTagManagerId),
    [googleTagManagerId]
  );
  const microsoftClarityValid = useMemo(
    () => !microsoftClarityId.trim() || isValidMicrosoftClarityId(microsoftClarityId),
    [microsoftClarityId]
  );
  const customScriptWarnings = useMemo(
    () =>
      getCustomScriptWarnings({
        head: customHeadScripts,
        bodyStart: customBodyStartScripts,
        bodyEnd: customBodyEndScripts,
      }),
    [customBodyEndScripts, customBodyStartScripts, customHeadScripts]
  );
  const trackingStatusItems = useMemo(
    () => [
      {
        label: "Meta Pixel",
        enabled: metaPixelEnabled,
        configured: metaPixelValidation.valid.length > 0,
        problem: metaPixelValidation.invalid.length
          ? `${metaPixelValidation.invalid.length} invalid ID(s)`
          : "",
      },
      {
        label: "Google Analytics / GTM",
        enabled: googleTagManagerEnabled,
        configured: Boolean(googleTagManagerId.trim()),
        problem: googleTagManagerValid ? "" : "Invalid Google ID",
      },
      {
        label: "Microsoft Clarity",
        enabled: microsoftClarityEnabled,
        configured: Boolean(microsoftClarityId.trim()),
        problem: microsoftClarityValid ? "" : "Invalid Clarity ID",
      },
      {
        label: "Verification tags",
        enabled: true,
        configured: Boolean(facebookDomainVerification.trim() || googleSiteVerification.trim()),
        problem: "",
      },
    ],
    [
      facebookDomainVerification,
      googleSiteVerification,
      googleTagManagerEnabled,
      googleTagManagerId,
      googleTagManagerValid,
      metaPixelEnabled,
      metaPixelValidation.invalid.length,
      metaPixelValidation.valid.length,
      microsoftClarityEnabled,
      microsoftClarityId,
      microsoftClarityValid,
    ]
  );

  function updateHeaderMenuItem(
    index: number,
    key: keyof HeaderMenuItem,
    value: string | boolean
  ) {
    setHeaderMenuItems((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function addHeaderMenuItem() {
    setHeaderMenuItems((items) => [
      ...items,
      { label: "New Link", href: "/", enabled: true },
    ]);
  }

  function removeHeaderMenuItem(index: number) {
    setHeaderMenuItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateFooterColumn(
    columnIndex: number,
    key: keyof Pick<FooterColumn, "title" | "enabled">,
    value: string | boolean
  ) {
    setFooterColumns((columns) =>
      columns.map((column, index) =>
        index === columnIndex ? { ...column, [key]: value } : column
      )
    );
  }

  function updateFooterColumnLink(
    columnIndex: number,
    linkIndex: number,
    key: keyof FooterSocialLink,
    value: string | boolean
  ) {
    setFooterColumns((columns) =>
      columns.map((column, index) =>
        index === columnIndex
          ? {
              ...column,
              links: column.links.map((link, nestedIndex) =>
                nestedIndex === linkIndex ? { ...link, [key]: value } : link
              ),
            }
          : column
      )
    );
  }

  function addFooterColumn() {
    setFooterColumns((columns) => [
      ...columns,
      {
        title: "New Column",
        enabled: true,
        links: [{ label: "New Link", href: "/", enabled: true }],
      },
    ]);
  }

  function removeFooterColumn(columnIndex: number) {
    setFooterColumns((columns) =>
      columns.filter((_, index) => index !== columnIndex)
    );
  }

  function addFooterColumnLink(columnIndex: number) {
    setFooterColumns((columns) =>
      columns.map((column, index) =>
        index === columnIndex
          ? {
              ...column,
              links: [...column.links, { label: "New Link", href: "/", enabled: true }],
            }
          : column
      )
    );
  }

  function removeFooterColumnLink(columnIndex: number, linkIndex: number) {
    setFooterColumns((columns) =>
      columns.map((column, index) =>
        index === columnIndex
          ? {
              ...column,
              links: column.links.filter((_, nestedIndex) => nestedIndex !== linkIndex),
            }
          : column
      )
    );
  }

  function updateFooterTrustItem(
    index: number,
    key: keyof FooterTrustItem,
    value: string | boolean
  ) {
    setFooterTrustItems((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function addFooterTrustItem() {
    setFooterTrustItems((items) => [
      ...items,
      { title: "New trust item", description: "Short support text", enabled: true },
    ]);
  }

  function removeFooterTrustItem(index: number) {
    setFooterTrustItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateFooterSocialLink(
    index: number,
    key: keyof FooterSocialLink,
    value: string | boolean
  ) {
    setFooterSocialLinks((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function addFooterSocialLink() {
    setFooterSocialLinks((items) => [
      ...items,
      { label: "Instagram", href: "https://instagram.com/", enabled: true },
    ]);
  }

  function removeFooterSocialLink(index: number) {
    setFooterSocialLinks((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateGlobalCopyGroup<Group extends keyof GlobalCopy>(
    group: Group,
    key: keyof GlobalCopy[Group],
    value: string
  ) {
    setGlobalCopy((copy) => ({
      ...copy,
      [group]: {
        ...copy[group],
        [key]: value,
      },
    }));
  }

  function updateCheckoutSetting<Key extends keyof CheckoutSettings>(
    key: Key,
    value: CheckoutSettings[Key]
  ) {
    setCheckoutSettings((settings) => ({
      ...settings,
      [key]: value,
    }));
  }

  function updateCartSetting<Key extends keyof CartSettings>(
    key: Key,
    value: CartSettings[Key]
  ) {
    setCartSettings((settings) => ({
      ...settings,
      [key]: value,
    }));
  }

  function updateCatalogSetting<Key extends keyof CatalogTemplateSettings>(
    key: Key,
    value: CatalogTemplateSettings[Key]
  ) {
    setCatalogSettings((settings) => ({
      ...settings,
      [key]: value,
    }));
  }

  function updateThemeSetting<Key extends keyof ThemeSettings>(
    key: Key,
    value: ThemeSettings[Key]
  ) {
    setThemeSettings((settings) => ({
      ...settings,
      [key]: value,
    }));
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      setSiteLoading(true);
      setSiteMsg(null);
      const res = await Fetch<SiteSettingsData>("/api/admin/site-settings", {
        auth: true,
        cache: "no-store",
      });
      if (!alive) return;
      if (!res.ok) {
        setSiteMsg(res.error || "Failed to load site settings.");
        setSiteLoading(false);
        return;
      }
      const data = res.data || {};
      setSiteName(data.siteName ?? "");
      setSiteUrl(data.siteUrl ?? "");
      setSiteFooterText(data.siteFooterText ?? "");
      setLogoImages(data.logoUrl ? [{ url: data.logoUrl, alt: data.logoAlt ?? "" }] : []);
      setIconImages(data.siteIconUrl ? [{ url: data.siteIconUrl, alt: data.siteIconAlt ?? "" }] : []);
      setMetaPixelEnabled(getTrackingStatus(data.metaPixelEnabled));
      setMetaPixelIds(data.metaPixelIds ?? "");
      setFacebookDomainVerification(data.facebookDomainVerification ?? "");
      setGoogleSiteVerification(data.googleSiteVerification ?? "");
      setGoogleTagManagerEnabled(getTrackingStatus(data.googleTagManagerEnabled));
      setGoogleTagManagerId(data.googleTagManagerId ?? "");
      setMicrosoftClarityEnabled(getTrackingStatus(data.microsoftClarityEnabled));
      setMicrosoftClarityId(data.microsoftClarityId ?? "");
      setCustomHeadScriptsEnabled(getTrackingStatus(data.customHeadScriptsEnabled));
      setCustomHeadScripts(data.customHeadScripts ?? "");
      setCustomBodyStartScriptsEnabled(getTrackingStatus(data.customBodyStartScriptsEnabled));
      setCustomBodyStartScripts(data.customBodyStartScripts ?? "");
      setCustomBodyEndScriptsEnabled(getTrackingStatus(data.customBodyEndScriptsEnabled));
      setCustomBodyEndScripts(data.customBodyEndScripts ?? "");
      setHeaderMenuItems(parseHeaderMenuItems(data.headerMenuItems));
      setHeaderSearchPlaceholder(
        data.headerSearchPlaceholder ?? DEFAULT_HEADER_SEARCH_PLACEHOLDER
      );
      setHeaderAnnouncementEnabled(
        typeof data.headerAnnouncementEnabled === "boolean"
          ? data.headerAnnouncementEnabled
          : true
      );
      setHeaderAnnouncementText(data.headerAnnouncementText ?? "");
      setHeaderAnnouncementHref(data.headerAnnouncementHref ?? "");
      setHeaderShowSearch(typeof data.headerShowSearch === "boolean" ? data.headerShowSearch : true);
      setHeaderShowAccount(typeof data.headerShowAccount === "boolean" ? data.headerShowAccount : true);
      setHeaderShowCart(typeof data.headerShowCart === "boolean" ? data.headerShowCart : true);
      setHeaderShowSupportLinks(
        typeof data.headerShowSupportLinks === "boolean"
          ? data.headerShowSupportLinks
          : true
      );
      setFooterCopyright(data.footerCopyright ?? DEFAULT_FOOTER_COPYRIGHT);
      setFooterColumns(parseFooterColumns(data.footerColumns));
      setFooterNewsletterEnabled(
        typeof data.footerNewsletterEnabled === "boolean"
          ? data.footerNewsletterEnabled
          : true
      );
      setFooterNewsletterEyebrow(
        data.footerNewsletterEyebrow ?? DEFAULT_FOOTER_NEWSLETTER.eyebrow
      );
      setFooterNewsletterTitle(
        data.footerNewsletterTitle ?? DEFAULT_FOOTER_NEWSLETTER.title
      );
      setFooterNewsletterSubtitle(
        data.footerNewsletterSubtitle ?? DEFAULT_FOOTER_NEWSLETTER.subtitle
      );
      setFooterNewsletterConsentText(
        data.footerNewsletterConsentText ?? DEFAULT_FOOTER_NEWSLETTER.consentText
      );
      setFooterTrustItems(parseFooterTrustItems(data.footerTrustItems));
      setFooterSocialLinks(parseFooterSocialLinks(data.footerSocialLinks));
      setGlobalCopy(parseGlobalCopy(data.globalCopy));
      setCheckoutSettings(parseCheckoutSettings(data.checkoutSettings));
      setCartSettings(parseCartSettings(data.cartSettings));
      setCatalogSettings(parseCatalogSettings(data.catalogSettings));
      setThemeSettings(parseThemeSettings(data.themeSettings));
      setSiteLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setStoreLoading(true);
      setStoreMsg(null);
      const res = await Fetch<StoreSettingsData>("/api/admin/store-settings", {
        auth: true,
        cache: "no-store",
      });
      if (!alive) return;
      if (!res.ok) {
        setStoreMsg(res.error || "Failed to load store settings.");
        setStoreLoading(false);
        return;
      }
      const data = res.data || {};
      setStoreName(data.storeName ?? "Store");
      setStoreDomain(data.storeDomain ?? "example.com");
      setFreeShippingThreshold(data.freeShippingThreshold ?? "PKR 10,000");
      setDefaultShippingFee(data.defaultShippingFee ?? "PKR 250");
      setReturnsDays(data.returnsDays ?? 7);
      setCodEnabled(typeof data.codEnabled === "boolean" ? data.codEnabled : true);
      setCardEnabled(typeof data.cardEnabled === "boolean" ? data.cardEnabled : true);
      setGatewayName(data.gatewayName ?? "PayFast / Stripe / JazzCash (placeholder)");
      setCryptoEnabled(typeof data.cryptoEnabled === "boolean" ? data.cryptoEnabled : false);
      setSiteTitle(data.siteTitle ?? "Online Store Pakistan");
      setSiteMetaDesc(
        data.siteMetaDesc ??
          "Shop quality products in Pakistan with secure checkout and fast delivery."
      );
      setIndexable(typeof data.indexable === "boolean" ? data.indexable : true);
      setStoreLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function saveSiteSettings(successMessage = "Site settings updated.") {
    setSiteSaving(true);
    setSiteMsg(null);
    try {
      if (activeTab === "tracking") {
        if (metaPixelValidation.invalid.length) {
          setSiteMsg(`Invalid Meta Pixel ID(s): ${metaPixelValidation.invalid.join(", ")}`);
          return;
        }
        if (!googleTagManagerValid) {
          setSiteMsg("Google ID must look like G-XXXXXXXXXX or GTM-XXXXXXX.");
          return;
        }
        if (!microsoftClarityValid) {
          setSiteMsg("Microsoft Clarity ID can only contain letters, numbers, dashes, and underscores.");
          return;
        }
      }

      const payload = {
        siteName: siteName.trim() || null,
        siteUrl: siteUrl.trim() || null,
        logoUrl: logoImages[0]?.url || null,
        logoAlt: logoImages[0]?.alt || null,
        siteIconUrl: iconImages[0]?.url || null,
        siteIconAlt: iconImages[0]?.alt || null,
        siteFooterText: siteFooterText.trim() || null,
        metaPixelEnabled,
        metaPixelIds: metaPixelIds.trim() || null,
        facebookDomainVerification: facebookDomainVerification.trim() || null,
        googleSiteVerification: googleSiteVerification.trim() || null,
        googleTagManagerEnabled,
        googleTagManagerId: googleTagManagerId.trim() || null,
        microsoftClarityEnabled,
        microsoftClarityId: microsoftClarityId.trim() || null,
        customHeadScriptsEnabled,
        customHeadScripts: customHeadScripts.trim() || null,
        customBodyStartScriptsEnabled,
        customBodyStartScripts: customBodyStartScripts.trim() || null,
        customBodyEndScriptsEnabled,
        customBodyEndScripts: customBodyEndScripts.trim() || null,
        headerMenuItems: serializeHeaderMenuItems(headerMenuItems),
        headerSearchPlaceholder: headerSearchPlaceholder.trim() || null,
        headerAnnouncementEnabled,
        headerAnnouncementText: headerAnnouncementText.trim() || null,
        headerAnnouncementHref: headerAnnouncementHref.trim() || null,
        headerShowSearch,
        headerShowAccount,
        headerShowCart,
        headerShowSupportLinks,
        footerCopyright: footerCopyright.trim() || null,
        footerColumns: serializeFooterColumns(footerColumns),
        footerNewsletterEnabled,
        footerNewsletterEyebrow: footerNewsletterEyebrow.trim() || null,
        footerNewsletterTitle: footerNewsletterTitle.trim() || null,
        footerNewsletterSubtitle: footerNewsletterSubtitle.trim() || null,
        footerNewsletterConsentText: footerNewsletterConsentText.trim() || null,
        footerTrustItems: serializeFooterTrustItems(footerTrustItems),
        footerSocialLinks: serializeFooterSocialLinks(footerSocialLinks),
        globalCopy: serializeGlobalCopy(globalCopy),
        checkoutSettings: serializeCheckoutSettings(checkoutSettings),
        cartSettings: serializeCartSettings(cartSettings),
        catalogSettings: serializeCatalogSettings(catalogSettings),
        themeSettings: serializeThemeSettings(themeSettings),
      };

      const res = await Fetch("/api/admin/site-settings", {
        method: "PUT",
        auth: true,
        data: payload,
      });

      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);
      setSiteMsg(successMessage);
    } catch (error) {
      setSiteMsg(getErrorMessage(error, "Failed to update site settings."));
    } finally {
      setSiteSaving(false);
    }
  }

  async function saveStoreSettings(successMessage = "Store settings updated.") {
    setStoreSaving(true);
    setStoreMsg(null);
    try {
      const syncedStoreDomain = deriveDomainFromSiteUrl(siteUrl) || storeDomain || null;
      const payload = {
        storeName,
        storeDomain: syncedStoreDomain,
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
      setStoreDomain(syncedStoreDomain || "");
      setStoreMsg(successMessage);
    } catch (error) {
      setStoreMsg(getErrorMessage(error, "Failed to save store settings."));
    } finally {
      setStoreSaving(false);
    }
  }

  async function saveSiteAndStoreSettings() {
    await saveSiteSettings("Site identity updated.");
    await saveStoreSettings("Store identity updated.");
  }

  async function saveSecurity() {
    setSecuritySaving(true);
    setSecurityMsg(null);
    if (!currentEmail.trim()) {
      setSecurityMsg("Current email required.");
      setSecuritySaving(false);
      return;
    }

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

      setSecurityMsg("Admin security updated.");
      setNewPassword("");
    } catch (error) {
      setSecurityMsg(getErrorMessage(error, "Failed to update admin security."));
    } finally {
      setSecuritySaving(false);
    }
  }

  const loadingMessage = siteLoading || storeLoading ? "Loading settings..." : null;

  return (
    <div className="bg-white">
      <AdminTopbar title="Settings" />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          eyebrow="Admin settings"
          title="Settings Hub"
          description="Manage branding, site identity, shopping, checkout, tracking, custom code, and security from focused settings areas."
        />

        {loadingMessage ? <div className="mt-5"><Message>{loadingMessage}</Message></div> : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-5 space-y-2">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-white" : "text-neutral-500"}`} />
                    <span>
                      <span className="block text-sm font-semibold">{tab.label}</span>
                      <span className={`mt-1 block text-xs leading-5 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
                        {tab.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="lg:col-span-8 xl:col-span-9">
            <AdminSection
              title={activeTabMeta.label}
              description={activeTabMeta.description}
            >
              {activeTab === "branding" ? (
                <div className="space-y-6">
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  <AdminCard
                    title="Brand identity"
                    description="These values should be client-safe and generic enough for any store niche."
                    actions={
                      <PrimaryButton
                        onClick={() => saveSiteSettings("Branding updated.")}
                        disabled={siteSaving}
                      >
                        {siteSaving ? "Saving..." : "Save branding"}
                      </PrimaryButton>
                    }
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label="Site name">
                        <input
                          value={siteName}
                          onChange={(e) => setSiteName(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="Your Store"
                        />
                      </AdminField>
                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <p className="text-sm font-semibold text-neutral-900">Website URL</p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          Managed once in Site Settings, then reused for SEO, canonical URLs, sitemaps, and admin references.
                        </p>
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
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "design" ? (
                <div className="space-y-6">
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  <AdminCard
                    title="Design and theme"
                    description="Set reusable brand tokens that power buttons, cards, header, footer, and key storefront surfaces."
                    actions={
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setThemeSettings(DEFAULT_THEME_SETTINGS)}
                          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50"
                        >
                          Reset defaults
                        </button>
                        <PrimaryButton
                          onClick={() => saveSiteSettings("Theme settings updated.")}
                          disabled={siteSaving}
                        >
                          {siteSaving ? "Saving..." : "Save theme"}
                        </PrimaryButton>
                      </div>
                    }
                  >
                    <div className="grid gap-6 xl:grid-cols-5">
                      <div className="space-y-5 xl:col-span-3">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <ThemeColorField
                            label="Primary color"
                            description="Used for main buttons and strong highlights."
                            value={themeSettings.primaryColor}
                            onChange={(value) => updateThemeSetting("primaryColor", value)}
                          />
                          <ThemeColorField
                            label="Primary hover color"
                            value={themeSettings.primaryHoverColor}
                            onChange={(value) => updateThemeSetting("primaryHoverColor", value)}
                          />
                          <ThemeColorField
                            label="Accent color"
                            description="Used for small trust/status accents."
                            value={themeSettings.accentColor}
                            onChange={(value) => updateThemeSetting("accentColor", value)}
                          />
                          <ThemeColorField
                            label="Secondary color"
                            value={themeSettings.secondaryColor}
                            onChange={(value) => updateThemeSetting("secondaryColor", value)}
                          />
                          <ThemeColorField
                            label="Background color"
                            value={themeSettings.backgroundColor}
                            onChange={(value) => updateThemeSetting("backgroundColor", value)}
                          />
                          <ThemeColorField
                            label="Surface color"
                            value={themeSettings.surfaceColor}
                            onChange={(value) => updateThemeSetting("surfaceColor", value)}
                          />
                          <ThemeColorField
                            label="Text color"
                            value={themeSettings.textColor}
                            onChange={(value) => updateThemeSetting("textColor", value)}
                          />
                          <ThemeColorField
                            label="Muted text color"
                            value={themeSettings.mutedTextColor}
                            onChange={(value) => updateThemeSetting("mutedTextColor", value)}
                          />
                          <ThemeColorField
                            label="Border color"
                            value={themeSettings.borderColor}
                            onChange={(value) => updateThemeSetting("borderColor", value)}
                          />
                          <AdminField label="Font style">
                            <select
                              value={themeSettings.fontChoice}
                              onChange={(event) =>
                                updateThemeSetting("fontChoice", event.target.value as ThemeFontChoice)
                              }
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            >
                              <option value="classic">Classic ecommerce</option>
                              <option value="modern">Modern sans</option>
                              <option value="system">System default</option>
                            </select>
                          </AdminField>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <AdminField label="Button radius" description="0 to 32 pixels.">
                            <input
                              type="number"
                              min={0}
                              max={32}
                              value={themeSettings.buttonRadius}
                              onChange={(event) =>
                                updateThemeSetting("buttonRadius", Number(event.target.value))
                              }
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </AdminField>
                          <AdminField label="Card radius" description="0 to 32 pixels.">
                            <input
                              type="number"
                              min={0}
                              max={32}
                              value={themeSettings.cardRadius}
                              onChange={(event) =>
                                updateThemeSetting("cardRadius", Number(event.target.value))
                              }
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </AdminField>
                        </div>
                      </div>

                      <div className="xl:col-span-2">
                        <div
                          className="sticky top-6 rounded-3xl border p-5 shadow-sm"
                          style={{
                            background: themeSettings.backgroundColor,
                            color: themeSettings.textColor,
                            borderColor: themeSettings.borderColor,
                            borderRadius: themeSettings.cardRadius,
                          }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: themeSettings.mutedTextColor }}>
                            Theme preview
                          </p>
                          <h3
                            className="mt-3 text-2xl font-semibold"
                            style={{
                              fontFamily:
                                themeSettings.fontChoice === "classic"
                                  ? "Georgia, serif"
                                  : "ui-sans-serif, system-ui, sans-serif",
                            }}
                          >
                            Brand-ready storefront
                          </h3>
                          <p className="mt-2 text-sm leading-6" style={{ color: themeSettings.mutedTextColor }}>
                            Buttons, cards, borders, and key commerce surfaces use these reusable tokens.
                          </p>
                          <div
                            className="mt-5 rounded-2xl border p-4"
                            style={{
                              background: themeSettings.surfaceColor,
                              borderColor: themeSettings.borderColor,
                              borderRadius: themeSettings.cardRadius,
                            }}
                          >
                            <div className="h-24 rounded-2xl" style={{ background: themeSettings.secondaryColor }} />
                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold">Sample Product</p>
                                <p className="text-xs" style={{ color: themeSettings.mutedTextColor }}>PKR 2,100</p>
                              </div>
                              <span
                                className="rounded-full px-3 py-1 text-xs font-medium"
                                style={{ background: themeSettings.accentColor, color: "#ffffff" }}
                              >
                                Trust
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              className="px-4 py-3 text-sm font-semibold text-white"
                              style={{
                                background: themeSettings.primaryColor,
                                borderRadius: themeSettings.buttonRadius,
                              }}
                            >
                              Primary button
                            </button>
                            <button
                              type="button"
                              className="border px-4 py-3 text-sm font-semibold"
                              style={{
                                borderColor: themeSettings.borderColor,
                                background: themeSettings.backgroundColor,
                                color: themeSettings.textColor,
                                borderRadius: themeSettings.buttonRadius,
                              }}
                            >
                              Secondary
                            </button>
                          </div>

                          {themeWarnings.length ? (
                            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                              {themeWarnings.map((warning) => (
                                <p key={warning}>{warning}</p>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                              Contrast checks look good.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "site" ? (
                <div className="space-y-6">
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  {storeMsg ? <Message>{storeMsg}</Message> : null}
                  <AdminCard
                    title="Site and store identity"
                    description="Keep public identity and domain values in one easy place."
                    actions={
                      <PrimaryButton
                        onClick={saveSiteAndStoreSettings}
                        disabled={siteSaving || storeSaving}
                      >
                        {siteSaving || storeSaving ? "Saving..." : "Save site settings"}
                      </PrimaryButton>
                    }
                  >
                    <div className="grid gap-4">
                      <AdminField label="Site URL" description="The public website URL used for canonical URLs and metadata.">
                        <input
                          value={siteUrl}
                          onChange={(e) => setSiteUrl(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="https://www.example.com"
                        />
                      </AdminField>
                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <p className="text-sm font-semibold text-neutral-900">Synced domain</p>
                        <p className="mt-1 text-sm text-neutral-700">
                          {deriveDomainFromSiteUrl(siteUrl) || storeDomain || "Add a site URL to generate the domain."}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          This is generated from the Site URL and saved into the old store domain field for backward compatibility.
                        </p>
                      </div>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "headerFooter" ? (
                <div className="space-y-6">
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  <AdminCard
                    title="Header navigation"
                    description="Control the public header menu, search field, announcement strip, and key header actions."
                    actions={
                      <PrimaryButton
                        onClick={() => saveSiteSettings("Header/footer settings updated.")}
                        disabled={siteSaving}
                      >
                        {siteSaving ? "Saving..." : "Save header/footer"}
                      </PrimaryButton>
                    }
                  >
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">Menu items</p>
                            <p className="mt-1 text-xs leading-5 text-neutral-500">
                              These links replace the old hardcoded header navigation.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addHeaderMenuItem}
                            className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                          >
                            <Plus className="h-4 w-4" />
                            Add link
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {headerMenuItems.map((item, index) => (
                            <div
                              key={index}
                              className="grid gap-3 rounded-2xl border border-neutral-200 p-4 lg:grid-cols-[1fr_1fr_auto_auto]"
                            >
                              <AdminField label="Label">
                                <input
                                  value={item.label}
                                  onChange={(e) =>
                                    updateHeaderMenuItem(index, "label", e.target.value)
                                  }
                                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Shop"
                                />
                              </AdminField>
                              <AdminField label="URL">
                                <input
                                  value={item.href}
                                  onChange={(e) =>
                                    updateHeaderMenuItem(index, "href", e.target.value)
                                  }
                                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                  placeholder="/shop"
                                />
                              </AdminField>
                              <label className="flex items-center gap-2 self-end rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700">
                                <input
                                  type="checkbox"
                                  checked={item.enabled !== false}
                                  onChange={(e) =>
                                    updateHeaderMenuItem(index, "enabled", e.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-neutral-300"
                                />
                                Show
                              </label>
                              <button
                                type="button"
                                onClick={() => removeHeaderMenuItem(index)}
                                disabled={headerMenuItems.length <= 1}
                                className="inline-flex items-center justify-center self-end rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Remove menu item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <AdminField label="Search placeholder">
                          <input
                            value={headerSearchPlaceholder}
                            onChange={(e) => setHeaderSearchPlaceholder(e.target.value)}
                            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            placeholder={DEFAULT_HEADER_SEARCH_PLACEHOLDER}
                          />
                        </AdminField>
                        <AdminField label="Announcement link" description="Optional. Leave empty for plain text.">
                          <input
                            value={headerAnnouncementHref}
                            onChange={(e) => setHeaderAnnouncementHref(e.target.value)}
                            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            placeholder="/deals"
                          />
                        </AdminField>
                      </div>

                      <AdminField label="Announcement text">
                        <input
                          value={headerAnnouncementText}
                          onChange={(e) => setHeaderAnnouncementText(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="Standard shipping {{shippingFee}} across Pakistan"
                        />
                      </AdminField>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Toggle
                          label="Show announcement strip"
                          checked={headerAnnouncementEnabled}
                          onChange={setHeaderAnnouncementEnabled}
                        />
                        <Toggle
                          label="Show search"
                          checked={headerShowSearch}
                          onChange={setHeaderShowSearch}
                        />
                        <Toggle
                          label="Show account button"
                          checked={headerShowAccount}
                          onChange={setHeaderShowAccount}
                        />
                        <Toggle
                          label="Show cart button"
                          checked={headerShowCart}
                          onChange={setHeaderShowCart}
                        />
                        <Toggle
                          label="Show track/support links"
                          checked={headerShowSupportLinks}
                          onChange={setHeaderShowSupportLinks}
                        />
                      </div>
                    </div>
                  </AdminCard>

                  <AdminCard
                    title="Footer content"
                    description="Manage footer description, columns, newsletter, trust items, social links, and copyright from one focused area."
                    actions={
                      <PrimaryButton
                        onClick={() => saveSiteSettings("Footer settings updated.")}
                        disabled={siteSaving}
                      >
                        {siteSaving ? "Saving..." : "Save footer"}
                      </PrimaryButton>
                    }
                  >
                    <div className="space-y-8">
                      <div className="grid gap-4">
                        <AdminField label="Footer text" description="Short brand description shown under the footer logo.">
                          <textarea
                            value={siteFooterText}
                            onChange={(e) => setSiteFooterText(e.target.value)}
                            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            rows={4}
                            placeholder="Short brand description shown in the footer."
                          />
                        </AdminField>
                        <AdminField label="Copyright text" description="You can use {{year}} and {{siteName}}.">
                          <input
                            value={footerCopyright}
                            onChange={(e) => setFooterCopyright(e.target.value)}
                            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            placeholder={DEFAULT_FOOTER_COPYRIGHT}
                          />
                        </AdminField>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">Footer columns</p>
                            <p className="mt-1 text-xs leading-5 text-neutral-500">
                              Manage public footer link groups without editing code.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addFooterColumn}
                            className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                          >
                            <Plus className="h-4 w-4" />
                            Add column
                          </button>
                        </div>

                        <div className="mt-4 space-y-4">
                          {footerColumns.map((column, columnIndex) => (
                            <div key={columnIndex} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                                <AdminField label="Column title">
                                  <input
                                    value={column.title}
                                    onChange={(e) =>
                                      updateFooterColumn(columnIndex, "title", e.target.value)
                                    }
                                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                    placeholder="Shop"
                                  />
                                </AdminField>
                                <label className="flex items-center gap-2 self-end rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700">
                                  <input
                                    type="checkbox"
                                    checked={column.enabled !== false}
                                    onChange={(e) =>
                                      updateFooterColumn(columnIndex, "enabled", e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-neutral-300"
                                  />
                                  Show
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeFooterColumn(columnIndex)}
                                  disabled={footerColumns.length <= 1}
                                  className="inline-flex items-center justify-center self-end rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  aria-label="Remove footer column"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mt-4 space-y-3">
                                {column.links.map((link, linkIndex) => (
                                  <div
                                    key={linkIndex}
                                    className="grid gap-3 rounded-2xl bg-neutral-50 p-3 lg:grid-cols-[1fr_1fr_auto_auto]"
                                  >
                                    <input
                                      value={link.label}
                                      onChange={(e) =>
                                        updateFooterColumnLink(
                                          columnIndex,
                                          linkIndex,
                                          "label",
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                      placeholder="Link label"
                                      aria-label="Footer link label"
                                    />
                                    <input
                                      value={link.href}
                                      onChange={(e) =>
                                        updateFooterColumnLink(
                                          columnIndex,
                                          linkIndex,
                                          "href",
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                      placeholder="/shop"
                                      aria-label="Footer link URL"
                                    />
                                    <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700">
                                      <input
                                        type="checkbox"
                                        checked={link.enabled !== false}
                                        onChange={(e) =>
                                          updateFooterColumnLink(
                                            columnIndex,
                                            linkIndex,
                                            "enabled",
                                            e.target.checked
                                          )
                                        }
                                        className="h-4 w-4 rounded border-neutral-300"
                                      />
                                      Show
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => removeFooterColumnLink(columnIndex, linkIndex)}
                                      disabled={column.links.length <= 1}
                                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                      aria-label="Remove footer link"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addFooterColumnLink(columnIndex)}
                                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                                >
                                  Add link
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-4 rounded-2xl border border-neutral-200 p-4">
                          <Toggle
                            label="Show newsletter block"
                            checked={footerNewsletterEnabled}
                            onChange={setFooterNewsletterEnabled}
                          />
                          <AdminField label="Newsletter eyebrow">
                            <input
                              value={footerNewsletterEyebrow}
                              onChange={(e) => setFooterNewsletterEyebrow(e.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </AdminField>
                          <AdminField label="Newsletter title">
                            <input
                              value={footerNewsletterTitle}
                              onChange={(e) => setFooterNewsletterTitle(e.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </AdminField>
                          <AdminField label="Newsletter subtitle">
                            <textarea
                              value={footerNewsletterSubtitle}
                              onChange={(e) => setFooterNewsletterSubtitle(e.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                              rows={3}
                            />
                          </AdminField>
                          <AdminField label="Newsletter consent text">
                            <input
                              value={footerNewsletterConsentText}
                              onChange={(e) => setFooterNewsletterConsentText(e.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            />
                          </AdminField>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Trust strip</p>
                              <p className="mt-1 text-xs leading-5 text-neutral-500">
                                Small reassurance items shown in the footer newsletter area.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={addFooterTrustItem}
                              className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                            >
                              Add
                            </button>
                          </div>
                          <div className="mt-4 space-y-3">
                            {footerTrustItems.map((item, index) => (
                              <div key={index} className="grid gap-3 rounded-2xl bg-neutral-50 p-3">
                                <input
                                  value={item.title}
                                  onChange={(e) =>
                                    updateFooterTrustItem(index, "title", e.target.value)
                                  }
                                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Quality Checked"
                                  aria-label="Trust item title"
                                />
                                <input
                                  value={item.description || ""}
                                  onChange={(e) =>
                                    updateFooterTrustItem(index, "description", e.target.value)
                                  }
                                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Checked before dispatch"
                                  aria-label="Trust item description"
                                />
                                <div className="flex items-center justify-between gap-3">
                                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                    <input
                                      type="checkbox"
                                      checked={item.enabled !== false}
                                      onChange={(e) =>
                                        updateFooterTrustItem(index, "enabled", e.target.checked)
                                      }
                                      className="h-4 w-4 rounded border-neutral-300"
                                    />
                                    Show
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => removeFooterTrustItem(index)}
                                    disabled={footerTrustItems.length <= 1}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-neutral-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">Social links</p>
                            <p className="mt-1 text-xs leading-5 text-neutral-500">
                              Optional links shown in the footer bottom bar.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addFooterSocialLink}
                            className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                          >
                            Add social
                          </button>
                        </div>
                        <div className="mt-4 space-y-3">
                          {footerSocialLinks.length ? (
                            footerSocialLinks.map((item, index) => (
                              <div
                                key={index}
                                className="grid gap-3 rounded-2xl bg-neutral-50 p-3 lg:grid-cols-[1fr_1fr_auto_auto]"
                              >
                                <input
                                  value={item.label}
                                  onChange={(e) =>
                                    updateFooterSocialLink(index, "label", e.target.value)
                                  }
                                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                  placeholder="Instagram"
                                  aria-label="Social link label"
                                />
                                <input
                                  value={item.href}
                                  onChange={(e) =>
                                    updateFooterSocialLink(index, "href", e.target.value)
                                  }
                                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                  placeholder="https://instagram.com/yourstore"
                                  aria-label="Social link URL"
                                />
                                <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700">
                                  <input
                                    type="checkbox"
                                    checked={item.enabled !== false}
                                    onChange={(e) =>
                                      updateFooterSocialLink(index, "enabled", e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-neutral-300"
                                  />
                                  Show
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeFooterSocialLink(index)}
                                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                                  aria-label="Remove social link"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                              No social links added yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "globalCopy" ? (
                <div className="space-y-6">
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  <AdminCard
                    title="Global copy"
                    description="Reusable labels and short messages used across product cards, cart drawer, cart page, checkout buttons, and trust strips."
                    actions={
                      <PrimaryButton
                        onClick={() => saveSiteSettings("Global copy updated.")}
                        disabled={siteSaving}
                      >
                        {siteSaving ? "Saving..." : "Save global copy"}
                      </PrimaryButton>
                    }
                  >
                    <div className="space-y-8">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Product buttons</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Add to cart"
                            value={globalCopy.product.addToCart}
                            onChange={(value) => updateGlobalCopyGroup("product", "addToCart", value)}
                          />
                          <CopyInput
                            label="Buy now"
                            value={globalCopy.product.buyNow}
                            onChange={(value) => updateGlobalCopyGroup("product", "buyNow", value)}
                          />
                          <CopyInput
                            label="Mobile cart short label"
                            value={globalCopy.product.mobileCartShort}
                            onChange={(value) =>
                              updateGlobalCopyGroup("product", "mobileCartShort", value)
                            }
                          />
                          <CopyInput
                            label="Related products title"
                            value={globalCopy.product.relatedProductsTitle}
                            onChange={(value) =>
                              updateGlobalCopyGroup("product", "relatedProductsTitle", value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Cart drawer</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Drawer title"
                            value={globalCopy.cart.drawerTitle}
                            onChange={(value) => updateGlobalCopyGroup("cart", "drawerTitle", value)}
                          />
                          <CopyInput
                            label="Drawer subtitle"
                            description="Use {{count}} for item count."
                            value={globalCopy.cart.drawerSubtitle}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "drawerSubtitle", value)
                            }
                          />
                          <CopyInput
                            label="Empty cart title"
                            value={globalCopy.cart.emptyTitle}
                            onChange={(value) => updateGlobalCopyGroup("cart", "emptyTitle", value)}
                          />
                          <CopyInput
                            label="Empty cart message"
                            value={globalCopy.cart.emptyBody}
                            onChange={(value) => updateGlobalCopyGroup("cart", "emptyBody", value)}
                            multiline
                          />
                          <CopyInput
                            label="Continue shopping"
                            value={globalCopy.cart.continueShopping}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "continueShopping", value)
                            }
                          />
                          <CopyInput
                            label="View cart"
                            value={globalCopy.cart.viewCart}
                            onChange={(value) => updateGlobalCopyGroup("cart", "viewCart", value)}
                          />
                          <CopyInput
                            label="Checkout"
                            value={globalCopy.cart.checkout}
                            onChange={(value) => updateGlobalCopyGroup("cart", "checkout", value)}
                          />
                          <CopyInput
                            label="Shipping note"
                            value={globalCopy.cart.shippingNote}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "shippingNote", value)
                            }
                            multiline
                          />
                          <CopyInput
                            label="Free shipping progress"
                            description="Use {{amount}} for remaining amount."
                            value={globalCopy.cart.freeShippingProgress}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "freeShippingProgress", value)
                            }
                          />
                          <CopyInput
                            label="Free shipping unlocked"
                            value={globalCopy.cart.freeShippingUnlocked}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "freeShippingUnlocked", value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Cart page</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Page title"
                            value={globalCopy.cart.cartPageTitle}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "cartPageTitle", value)
                            }
                          />
                          <CopyInput
                            label="Page subtitle"
                            value={globalCopy.cart.cartPageSubtitle}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "cartPageSubtitle", value)
                            }
                            multiline
                          />
                          <CopyInput
                            label="Empty page message"
                            value={globalCopy.cart.cartPageEmptyBody}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "cartPageEmptyBody", value)
                            }
                            multiline
                          />
                          <CopyInput
                            label="Order summary title"
                            value={globalCopy.cart.orderSummaryTitle}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "orderSummaryTitle", value)
                            }
                          />
                          <CopyInput
                            label="Items title"
                            value={globalCopy.cart.itemsTitle}
                            onChange={(value) => updateGlobalCopyGroup("cart", "itemsTitle", value)}
                          />
                          <CopyInput
                            label="Items count"
                            description="Use {{count}} for item count."
                            value={globalCopy.cart.itemsCount}
                            onChange={(value) => updateGlobalCopyGroup("cart", "itemsCount", value)}
                          />
                          <CopyInput
                            label="Add more"
                            value={globalCopy.cart.addMore}
                            onChange={(value) => updateGlobalCopyGroup("cart", "addMore", value)}
                          />
                          <CopyInput
                            label="Remove item"
                            value={globalCopy.cart.removeItem}
                            onChange={(value) => updateGlobalCopyGroup("cart", "removeItem", value)}
                          />
                          <CopyInput
                            label="Item shipping badge"
                            value={globalCopy.cart.itemShippingBadge}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "itemShippingBadge", value)
                            }
                          />
                          <CopyInput
                            label="Saved amount"
                            description="Use {{amount}} for discount amount."
                            value={globalCopy.cart.savedAmount}
                            onChange={(value) => updateGlobalCopyGroup("cart", "savedAmount", value)}
                          />
                          <CopyInput
                            label="Subtotal label"
                            value={globalCopy.cart.subtotal}
                            onChange={(value) => updateGlobalCopyGroup("cart", "subtotal", value)}
                          />
                          <CopyInput
                            label="Shipping label"
                            value={globalCopy.cart.shipping}
                            onChange={(value) => updateGlobalCopyGroup("cart", "shipping", value)}
                          />
                          <CopyInput
                            label="Discount label"
                            value={globalCopy.cart.discount}
                            onChange={(value) => updateGlobalCopyGroup("cart", "discount", value)}
                          />
                          <CopyInput
                            label="Total label"
                            value={globalCopy.cart.total}
                            onChange={(value) => updateGlobalCopyGroup("cart", "total", value)}
                          />
                          <CopyInput
                            label="Free shipping label"
                            value={globalCopy.cart.noShipping}
                            onChange={(value) => updateGlobalCopyGroup("cart", "noShipping", value)}
                          />
                          <CopyInput
                            label="Coupon title"
                            value={globalCopy.cart.couponTitle}
                            onChange={(value) => updateGlobalCopyGroup("cart", "couponTitle", value)}
                          />
                          <CopyInput
                            label="Apply coupon button"
                            value={globalCopy.cart.applyCoupon}
                            onChange={(value) => updateGlobalCopyGroup("cart", "applyCoupon", value)}
                          />
                          <CopyInput
                            label="Applied coupon"
                            description="Use {{code}} for coupon code."
                            value={globalCopy.cart.appliedCoupon}
                            onChange={(value) => updateGlobalCopyGroup("cart", "appliedCoupon", value)}
                          />
                          <CopyInput
                            label="Remove coupon"
                            value={globalCopy.cart.removeCoupon}
                            onChange={(value) => updateGlobalCopyGroup("cart", "removeCoupon", value)}
                          />
                          <CopyInput
                            label="Need help title"
                            value={globalCopy.cart.needHelpTitle}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "needHelpTitle", value)
                            }
                          />
                          <CopyInput
                            label="Need help body"
                            value={globalCopy.cart.needHelpBody}
                            onChange={(value) =>
                              updateGlobalCopyGroup("cart", "needHelpBody", value)
                            }
                            multiline
                          />
                          <CopyInput
                            label="Mobile summary"
                            description="Use {{count}} and {{shipping}}."
                            value={globalCopy.cart.mobileSummary}
                            onChange={(value) => updateGlobalCopyGroup("cart", "mobileSummary", value)}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Cart links and behavior</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Continue shopping URL"
                            value={cartSettings.continueShoppingHref}
                            onChange={(value) =>
                              updateCartSetting("continueShoppingHref", value)
                            }
                          />
                          <CopyInput
                            label="Empty primary URL"
                            value={cartSettings.emptyPrimaryHref}
                            onChange={(value) => updateCartSetting("emptyPrimaryHref", value)}
                          />
                          <CopyInput
                            label="Empty secondary URL"
                            value={cartSettings.emptySecondaryHref}
                            onChange={(value) => updateCartSetting("emptySecondaryHref", value)}
                          />
                          <CopyInput
                            label="Support URL"
                            value={cartSettings.supportHref}
                            onChange={(value) => updateCartSetting("supportHref", value)}
                          />
                          <CopyInput
                            label="Track order URL"
                            value={cartSettings.trackOrderHref}
                            onChange={(value) => updateCartSetting("trackOrderHref", value)}
                          />
                          <Toggle
                            label="Show free shipping progress"
                            description="Uses the threshold from Shipping settings."
                            checked={cartSettings.showFreeShippingProgress}
                            onChange={(value) =>
                              updateCartSetting("showFreeShippingProgress", value)
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">Checkout labels</p>
                          <div className="mt-4 grid gap-4">
                            <CopyInput
                              label="Checkout"
                              value={globalCopy.checkout.checkout}
                              onChange={(value) =>
                                updateGlobalCopyGroup("checkout", "checkout", value)
                              }
                            />
                            <CopyInput
                              label="Cash on Delivery title"
                              value={globalCopy.checkout.codTitle}
                              onChange={(value) =>
                                updateGlobalCopyGroup("checkout", "codTitle", value)
                              }
                            />
                            <CopyInput
                              label="Place order"
                              value={globalCopy.checkout.placeOrder}
                              onChange={(value) =>
                                updateGlobalCopyGroup("checkout", "placeOrder", value)
                              }
                            />
                            <CopyInput
                              label="Place order subtext"
                              value={globalCopy.checkout.placeOrderSubtext}
                              onChange={(value) =>
                                updateGlobalCopyGroup("checkout", "placeOrderSubtext", value)
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-neutral-900">Trust text</p>
                          <div className="mt-4 grid gap-4">
                            <CopyInput
                              label="Quality title"
                              value={globalCopy.trust.qualityTitle}
                              onChange={(value) =>
                                updateGlobalCopyGroup("trust", "qualityTitle", value)
                              }
                            />
                            <CopyInput
                              label="Quality text"
                              value={globalCopy.trust.qualityText}
                              onChange={(value) =>
                                updateGlobalCopyGroup("trust", "qualityText", value)
                              }
                            />
                            <CopyInput
                              label="Shipping title"
                              value={globalCopy.trust.shippingTitle}
                              onChange={(value) =>
                                updateGlobalCopyGroup("trust", "shippingTitle", value)
                              }
                            />
                            <CopyInput
                              label="Support title"
                              value={globalCopy.trust.supportTitle}
                              onChange={(value) =>
                                updateGlobalCopyGroup("trust", "supportTitle", value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "contact" ? (
                <AdminCard
                  title="Contact & support"
                  description="Contact fields already have their own focused admin page. This settings hub links to that page so support details stay managed in one place."
                  actions={<SecondaryLink href="/admin/contact">Open contact settings</SecondaryLink>}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["Phone", "WhatsApp", "Email", "Address", "Business hours", "Support notes"].map((item) => (
                      <div key={item} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <p className="text-sm font-semibold text-neutral-900">{item}</p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          Managed from the dedicated contact area.
                        </p>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              ) : null}

              {activeTab === "shopping" ? (
                <div className="space-y-6">
                  {storeMsg ? <Message>{storeMsg}</Message> : null}
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  <AdminCard
                    title="Shopping defaults"
                    description="Store-facing defaults for catalog and general shopping experience."
                    actions={
                      <PrimaryButton
                        onClick={() => saveStoreSettings("Shopping settings updated.")}
                        disabled={storeSaving}
                      >
                        {storeSaving ? "Saving..." : "Save shopping"}
                      </PrimaryButton>
                    }
                  >
                    <div className="grid gap-4">
                      <AdminField label="Store name">
                        <input
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </AdminField>
                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <p className="text-sm font-semibold text-neutral-900">Website/domain setting</p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          Website URL and domain are controlled only from Site Settings to avoid duplicate admin inputs.
                        </p>
                      </div>
                    </div>
                  </AdminCard>

                  <AdminCard
                    title="Catalog template content"
                    description="Reusable copy for shop, category, subcategory, and product templates."
                    actions={
                      <PrimaryButton
                        onClick={() => saveSiteSettings("Catalog template settings updated.")}
                        disabled={siteSaving}
                      >
                        {siteSaving ? "Saving..." : "Save catalog templates"}
                      </PrimaryButton>
                    }
                  >
                    <div className="space-y-8">
                      <AdminSection title="Product card display">
                        <AdminField
                          label="Mobile product cards"
                          description="Choose the mobile product grid/card style. Desktop layout is unchanged."
                        >
                          <select
                            value={catalogSettings.mobileProductCardLayout}
                            onChange={(e) =>
                              updateCatalogSetting(
                                "mobileProductCardLayout",
                                e.target.value as CatalogTemplateSettings["mobileProductCardLayout"]
                              )
                            }
                            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none hover:bg-neutral-50 focus:border-neutral-900"
                          >
                            <option value="compact-2">Compact mobile cards - 2 per row</option>
                            <option value="classic-1">Classic mobile cards - 1 per row</option>
                          </select>
                        </AdminField>
                      </AdminSection>

                      <AdminSection title="Shop page fallbacks">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Fallback title"
                            value={catalogSettings.shopFallbackTitle}
                            onChange={(value) => updateCatalogSetting("shopFallbackTitle", value)}
                          />
                          <CopyInput
                            label="Fallback subtitle"
                            value={catalogSettings.shopFallbackSubtitle}
                            onChange={(value) => updateCatalogSetting("shopFallbackSubtitle", value)}
                            multiline
                          />
                          <div className="sm:col-span-2">
                            <CopyInput
                              label="Fallback rich content HTML"
                              value={catalogSettings.shopFallbackRichHtml}
                              onChange={(value) => updateCatalogSetting("shopFallbackRichHtml", value)}
                              multiline
                            />
                          </div>
                        </div>
                      </AdminSection>

                      <AdminSection title="Category templates">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Eyebrow"
                            value={catalogSettings.categoryEyebrow}
                            onChange={(value) => updateCatalogSetting("categoryEyebrow", value)}
                          />
                          <CopyInput
                            label="Search placeholder"
                            value={catalogSettings.categorySearchPlaceholder}
                            onChange={(value) => updateCatalogSetting("categorySearchPlaceholder", value)}
                          />
                          <CopyInput
                            label="Fallback intro"
                            value={catalogSettings.categoryFallbackIntro}
                            onChange={(value) => updateCatalogSetting("categoryFallbackIntro", value)}
                            multiline
                          />
                          <CopyInput
                            label="Pagination tip"
                            value={catalogSettings.categoryPaginationTip}
                            onChange={(value) => updateCatalogSetting("categoryPaginationTip", value)}
                            multiline
                          />
                          <CopyInput
                            label="Trust badges, one per line"
                            value={listToText(catalogSettings.categoryTrustBadges)}
                            onChange={(value) =>
                              updateCatalogSetting("categoryTrustBadges", textToList(value))
                            }
                            multiline
                          />
                          <CopyInput
                            label="FAQ intro"
                            value={catalogSettings.categoryFaqIntro}
                            onChange={(value) => updateCatalogSetting("categoryFaqIntro", value)}
                            multiline
                          />
                          <CopyInput
                            label="Subcategory title template"
                            description="Use {{category}} token."
                            value={catalogSettings.categorySubcategoryTitleTemplate}
                            onChange={(value) =>
                              updateCatalogSetting("categorySubcategoryTitleTemplate", value)
                            }
                          />
                          <CopyInput
                            label="Subcategory intro"
                            value={catalogSettings.categorySubcategoryIntro}
                            onChange={(value) =>
                              updateCatalogSetting("categorySubcategoryIntro", value)
                            }
                            multiline
                          />
                          <CopyInput
                            label="Help title"
                            value={catalogSettings.categoryHelpTitle}
                            onChange={(value) => updateCatalogSetting("categoryHelpTitle", value)}
                          />
                          <CopyInput
                            label="Help body"
                            value={catalogSettings.categoryHelpBody}
                            onChange={(value) => updateCatalogSetting("categoryHelpBody", value)}
                            multiline
                          />
                          <CopyInput
                            label="Help primary label"
                            value={catalogSettings.categoryHelpPrimaryLabel}
                            onChange={(value) =>
                              updateCatalogSetting("categoryHelpPrimaryLabel", value)
                            }
                          />
                          <CopyInput
                            label="Help secondary label"
                            value={catalogSettings.categoryHelpSecondaryLabel}
                            onChange={(value) =>
                              updateCatalogSetting("categoryHelpSecondaryLabel", value)
                            }
                          />
                          <div className="sm:col-span-2">
                            <CopyInput
                              label="Sidebar trust items"
                              description="One per line: Title | Text"
                              value={itemsToText(catalogSettings.categorySidebarTrustItems)}
                              onChange={(value) =>
                                updateCatalogSetting("categorySidebarTrustItems", textToItems(value))
                              }
                              multiline
                            />
                          </div>
                        </div>
                      </AdminSection>

                      <AdminSection title="Subcategory templates">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Fallback intro"
                            value={catalogSettings.subcategoryFallbackIntro}
                            onChange={(value) =>
                              updateCatalogSetting("subcategoryFallbackIntro", value)
                            }
                            multiline
                          />
                          <CopyInput
                            label="FAQ intro"
                            value={catalogSettings.subcategoryFaqIntro}
                            onChange={(value) => updateCatalogSetting("subcategoryFaqIntro", value)}
                            multiline
                          />
                          <div className="sm:col-span-2">
                            <CopyInput
                              label="Fallback rich content HTML"
                              value={catalogSettings.subcategoryFallbackRichHtml}
                              onChange={(value) =>
                                updateCatalogSetting("subcategoryFallbackRichHtml", value)
                              }
                              multiline
                            />
                          </div>
                        </div>
                      </AdminSection>

                      <AdminSection title="Product templates">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Brand fallback"
                            value={catalogSettings.productBrandFallback}
                            onChange={(value) => updateCatalogSetting("productBrandFallback", value)}
                          />
                          <CopyInput
                            label="Fallback product description"
                            value={catalogSettings.productFallbackDescription}
                            onChange={(value) =>
                              updateCatalogSetting("productFallbackDescription", value)
                            }
                            multiline
                          />
                          <CopyInput
                            label="Gallery badges, one per line"
                            value={listToText(catalogSettings.productGalleryBadges)}
                            onChange={(value) =>
                              updateCatalogSetting("productGalleryBadges", textToList(value))
                            }
                            multiline
                          />
                          <CopyInput
                            label="Gallery trust items"
                            description="One per line: Title | Text"
                            value={itemsToText(catalogSettings.productGalleryTrustItems)}
                            onChange={(value) =>
                              updateCatalogSetting("productGalleryTrustItems", textToItems(value))
                            }
                            multiline
                          />
                          <CopyInput
                            label="Price label"
                            value={catalogSettings.productPriceLabel}
                            onChange={(value) => updateCatalogSetting("productPriceLabel", value)}
                          />
                          <CopyInput
                            label="Shipping note"
                            description="Use {{shipping}} token."
                            value={catalogSettings.productShippingNote}
                            onChange={(value) => updateCatalogSetting("productShippingNote", value)}
                            multiline
                          />
                          <CopyInput
                            label="Size helper"
                            value={catalogSettings.productSizeHelper}
                            onChange={(value) => updateCatalogSetting("productSizeHelper", value)}
                            multiline
                          />
                          <CopyInput
                            label="Fine print"
                            value={catalogSettings.productFinePrint}
                            onChange={(value) => updateCatalogSetting("productFinePrint", value)}
                            multiline
                          />
                          <CopyInput
                            label="Description tab label"
                            value={catalogSettings.productDescriptionTabLabel}
                            onChange={(value) =>
                              updateCatalogSetting("productDescriptionTabLabel", value)
                            }
                          />
                          <CopyInput
                            label="Reviews tab label"
                            value={catalogSettings.productReviewsTabLabel}
                            onChange={(value) =>
                              updateCatalogSetting("productReviewsTabLabel", value)
                            }
                          />
                          <CopyInput
                            label="Shipping tab label"
                            value={catalogSettings.productShippingTabLabel}
                            onChange={(value) =>
                              updateCatalogSetting("productShippingTabLabel", value)
                            }
                          />
                          <CopyInput
                            label="Reviews title"
                            value={catalogSettings.productReviewsTitle}
                            onChange={(value) => updateCatalogSetting("productReviewsTitle", value)}
                          />
                          <CopyInput
                            label="Reviews intro"
                            value={catalogSettings.productReviewsIntro}
                            onChange={(value) => updateCatalogSetting("productReviewsIntro", value)}
                            multiline
                          />
                          <CopyInput
                            label="Product FAQ title template"
                            description="Use {{product}} token."
                            value={catalogSettings.productFaqTitleTemplate}
                            onChange={(value) =>
                              updateCatalogSetting("productFaqTitleTemplate", value)
                            }
                          />
                          <CopyInput
                            label="Product FAQ intro"
                            value={catalogSettings.productFaqIntro}
                            onChange={(value) => updateCatalogSetting("productFaqIntro", value)}
                            multiline
                          />
                          <div className="sm:col-span-2">
                            <CopyInput
                              label="Shipping & returns tab HTML"
                              value={catalogSettings.productShippingReturnsHtml}
                              onChange={(value) =>
                                updateCatalogSetting("productShippingReturnsHtml", value)
                              }
                              multiline
                            />
                          </div>
                          <CopyInput
                            label="Related products title"
                            value={catalogSettings.relatedProductsTitle}
                            onChange={(value) => updateCatalogSetting("relatedProductsTitle", value)}
                          />
                          <CopyInput
                            label="Related products subtitle"
                            value={catalogSettings.relatedProductsSubtitle}
                            onChange={(value) =>
                              updateCatalogSetting("relatedProductsSubtitle", value)
                            }
                            multiline
                          />
                          <CopyInput
                            label="Related products button"
                            value={catalogSettings.relatedProductsViewAllLabel}
                            onChange={(value) =>
                              updateCatalogSetting("relatedProductsViewAllLabel", value)
                            }
                          />
                        </div>
                      </AdminSection>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "checkout" ? (
                <div className="space-y-6">
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  <AdminCard
                    title="Checkout experience"
                    description="Manage checkout-specific steps, field helpers, city list, trust badges, help text, and success page content."
                    actions={
                      <PrimaryButton
                        onClick={() => saveSiteSettings("Checkout settings updated.")}
                        disabled={siteSaving}
                      >
                        {siteSaving ? "Saving..." : "Save checkout"}
                      </PrimaryButton>
                    }
                  >
                    <div className="space-y-8">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                          <p className="text-sm font-semibold text-neutral-900">Payment methods</p>
                          <p className="mt-1 text-xs leading-5 text-neutral-500">
                            Payment availability is controlled only from the Payments tab.
                          </p>
                          <p className="mt-3 text-sm text-neutral-700">
                            COD: {codEnabled ? "Enabled" : "Disabled"} | Online: {cardEnabled ? "Enabled" : "Disabled"}
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab("payments")}
                            className="mt-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                          >
                            Manage payments
                          </button>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                          <p className="text-sm font-semibold text-neutral-900">Button and COD labels</p>
                          <p className="mt-1 text-xs leading-5 text-neutral-500">
                            Place order text, COD title/helper, and common checkout labels are controlled from Global Copy to avoid duplicate settings.
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab("globalCopy")}
                            className="mt-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                          >
                            Open global copy
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Step labels</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                          <CopyInput
                            label="Step 1"
                            value={checkoutSettings.yourDetailsStepLabel}
                            onChange={(value) => updateCheckoutSetting("yourDetailsStepLabel", value)}
                          />
                          <CopyInput
                            label="Step 2"
                            value={checkoutSettings.deliveryAddressStepLabel}
                            onChange={(value) => updateCheckoutSetting("deliveryAddressStepLabel", value)}
                          />
                          <CopyInput
                            label="Step 3"
                            value={checkoutSettings.confirmOrderStepLabel}
                            onChange={(value) => updateCheckoutSetting("confirmOrderStepLabel", value)}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Your details fields</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Phone label"
                            value={checkoutSettings.phoneLabel}
                            onChange={(value) => updateCheckoutSetting("phoneLabel", value)}
                          />
                          <CopyInput
                            label="Phone placeholder"
                            value={checkoutSettings.phonePlaceholder}
                            onChange={(value) => updateCheckoutSetting("phonePlaceholder", value)}
                          />
                          <CopyInput
                            label="Phone helper"
                            value={checkoutSettings.phoneHelper}
                            onChange={(value) => updateCheckoutSetting("phoneHelper", value)}
                            multiline
                          />
                          <CopyInput
                            label="Full name placeholder"
                            value={checkoutSettings.fullNamePlaceholder}
                            onChange={(value) => updateCheckoutSetting("fullNamePlaceholder", value)}
                          />
                          <CopyInput
                            label="Email label"
                            value={checkoutSettings.emailLabel}
                            onChange={(value) => updateCheckoutSetting("emailLabel", value)}
                          />
                          <AdminField label="Email mode">
                            <select
                              value={checkoutSettings.emailMode}
                              onChange={(event) =>
                                updateCheckoutSetting("emailMode", event.target.value as EmailMode)
                              }
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            >
                              <option value="optional">Optional</option>
                              <option value="required">Required</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </AdminField>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Delivery address</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="City placeholder"
                            value={checkoutSettings.cityPlaceholder}
                            onChange={(value) => updateCheckoutSetting("cityPlaceholder", value)}
                          />
                          <CopyInput
                            label="Address placeholder"
                            value={checkoutSettings.addressPlaceholder}
                            onChange={(value) => updateCheckoutSetting("addressPlaceholder", value)}
                          />
                          <CopyInput
                            label="Address helper"
                            value={checkoutSettings.addressHelper}
                            onChange={(value) => updateCheckoutSetting("addressHelper", value)}
                            multiline
                          />
                          <AdminField label="City list" description="One city per line. Keep Other at the end if you want broad coverage.">
                            <textarea
                              value={listToTextareaValue(checkoutSettings.cityOptions)}
                              onChange={(event) =>
                                updateCheckoutSetting("cityOptions", textareaValueToList(event.target.value))
                              }
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                              rows={8}
                            />
                          </AdminField>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <AdminField label="Trust badges" description="One badge per line.">
                          <textarea
                            value={listToTextareaValue(checkoutSettings.trustBadges)}
                            onChange={(event) =>
                              updateCheckoutSetting("trustBadges", textareaValueToList(event.target.value))
                            }
                            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                            rows={7}
                          />
                        </AdminField>
                        <div className="grid gap-4">
                          <CopyInput
                            label="WhatsApp help title"
                            value={checkoutSettings.helpTitle}
                            onChange={(value) => updateCheckoutSetting("helpTitle", value)}
                          />
                          <CopyInput
                            label="WhatsApp help button"
                            value={checkoutSettings.helpButtonLabel}
                            onChange={(value) => updateCheckoutSetting("helpButtonLabel", value)}
                          />
                          <CopyInput
                            label="Empty cart message"
                            value={checkoutSettings.emptyCartMessage}
                            onChange={(value) => updateCheckoutSetting("emptyCartMessage", value)}
                            multiline
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Success page</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <CopyInput
                            label="Success title"
                            value={checkoutSettings.successTitle}
                            onChange={(value) => updateCheckoutSetting("successTitle", value)}
                          />
                          <CopyInput
                            label="Success subtitle"
                            value={checkoutSettings.successSubtitle}
                            onChange={(value) => updateCheckoutSetting("successSubtitle", value)}
                            multiline
                          />
                          <CopyInput
                            label="Expected delivery text"
                            value={checkoutSettings.successExpectedDeliveryText}
                            onChange={(value) => updateCheckoutSetting("successExpectedDeliveryText", value)}
                          />
                          <CopyInput
                            label="Prepared title"
                            value={checkoutSettings.successPreparedTitle}
                            onChange={(value) => updateCheckoutSetting("successPreparedTitle", value)}
                          />
                          <CopyInput
                            label="Prepared text"
                            description="Use {{items}} for total items."
                            value={checkoutSettings.successPreparedText}
                            onChange={(value) => updateCheckoutSetting("successPreparedText", value)}
                            multiline
                          />
                          <CopyInput
                            label="Support button"
                            value={checkoutSettings.successSupportButtonLabel}
                            onChange={(value) => updateCheckoutSetting("successSupportButtonLabel", value)}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-semibold text-emerald-900">Conversion note</p>
                        <p className="mt-1 text-sm leading-6 text-emerald-800">
                          Checkout should stay COD-first, mobile-first, and focused on one main action: place order.
                        </p>
                      </div>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "shipping" ? (
                <div className="space-y-6">
                  {storeMsg ? <Message>{storeMsg}</Message> : null}
                  <AdminCard
                    title="Shipping & returns"
                    description="Delivery cost and return window used across shopping and checkout experiences."
                    actions={
                      <PrimaryButton
                        onClick={() => saveStoreSettings("Shipping settings updated.")}
                        disabled={storeSaving}
                      >
                        {storeSaving ? "Saving..." : "Save shipping"}
                      </PrimaryButton>
                    }
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label="Free shipping threshold">
                        <input
                          value={freeShippingThreshold}
                          onChange={(e) => setFreeShippingThreshold(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="PKR 10,000"
                        />
                      </AdminField>
                      <AdminField label="Default shipping fee">
                        <input
                          value={defaultShippingFee}
                          onChange={(e) => setDefaultShippingFee(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="PKR 250"
                        />
                      </AdminField>
                      <AdminField label="Return days">
                        <input
                          value={String(returnsDays)}
                          onChange={(e) => setReturnsDays(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          inputMode="numeric"
                        />
                      </AdminField>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "payments" ? (
                <div className="space-y-6">
                  {storeMsg ? <Message>{storeMsg}</Message> : null}
                  <AdminCard
                    title="Payment methods"
                    description="Enable only payment methods that are actually operational for the current client."
                    actions={
                      <PrimaryButton
                        onClick={() => saveStoreSettings("Payment settings updated.")}
                        disabled={storeSaving}
                      >
                        {storeSaving ? "Saving..." : "Save payments"}
                      </PrimaryButton>
                    }
                  >
                    <div className="space-y-3">
                      <Toggle label="Cash on Delivery (COD)" checked={codEnabled} onChange={setCodEnabled} />
                      <Toggle label="Card / online payment" checked={cardEnabled} onChange={setCardEnabled} />
                      <Toggle label="Crypto payments" checked={cryptoEnabled} onChange={setCryptoEnabled} />
                    </div>
                    <div className="mt-5">
                      <AdminField label="Gateway name / notes">
                        <textarea
                          value={gatewayName}
                          onChange={(e) => setGatewayName(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          rows={3}
                        />
                      </AdminField>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "seo" ? (
                <div className="space-y-6">
                  {storeMsg ? <Message>{storeMsg}</Message> : null}
                  <AdminCard
                    title="SEO defaults"
                    description="Fallback metadata used when individual pages/products do not define their own SEO."
                    actions={
                      <PrimaryButton
                        onClick={() => saveStoreSettings("SEO settings updated.")}
                        disabled={storeSaving}
                      >
                        {storeSaving ? "Saving..." : "Save SEO"}
                      </PrimaryButton>
                    }
                  >
                    <div className="space-y-4">
                      <AdminField label="Site title">
                        <input
                          value={siteTitle}
                          onChange={(e) => setSiteTitle(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </AdminField>
                      <AdminField label="Site meta description">
                        <textarea
                          value={siteMetaDesc}
                          onChange={(e) => setSiteMetaDesc(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          rows={4}
                        />
                      </AdminField>
                      <Toggle
                        label="Allow search engines to index the site"
                        description="Disable only when the site is not ready for public launch."
                        checked={indexable}
                        onChange={setIndexable}
                      />
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "tracking" ? (
                <div className="space-y-6">
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  <AdminCard
                    title="Tracking & integrations"
                    description="Manage pixels, tag containers, verification tokens, and ecommerce event readiness from one focused screen."
                    actions={
                      <PrimaryButton
                        onClick={() => saveSiteSettings("Tracking settings updated.")}
                        disabled={siteSaving}
                      >
                        {siteSaving ? "Saving..." : "Save tracking"}
                      </PrimaryButton>
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {trackingStatusItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                            {item.problem ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            ) : item.enabled && item.configured ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Power className="h-4 w-4 text-neutral-400" />
                            )}
                          </div>
                          <p className="mt-2 text-xs text-neutral-500">
                            {item.problem ||
                              (item.enabled
                                ? item.configured
                                  ? "Active"
                                  : "Not configured"
                                : "Disabled")}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                      <div className="space-y-4 rounded-2xl border border-neutral-200 p-4">
                        <Toggle
                          label="Enable Meta Pixel"
                          description="Controls Pixel base code and ecommerce events."
                          checked={metaPixelEnabled}
                          onChange={setMetaPixelEnabled}
                        />
                        <AdminField
                          label="Meta Pixel IDs"
                          description="One ID per line or comma separated."
                        >
                          <textarea
                            value={metaPixelIds}
                            onChange={(e) => setMetaPixelIds(e.target.value)}
                            className={[
                              "w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-neutral-900",
                              metaPixelValidation.invalid.length
                                ? "border-amber-300 bg-amber-50"
                                : "border-neutral-200",
                            ].join(" ")}
                            rows={5}
                            placeholder={"123456789012345\n987654321098765"}
                          />
                        </AdminField>
                        {metaPixelValidation.valid.length ? (
                          <p className="text-xs text-emerald-700">
                            Valid IDs: {metaPixelValidation.valid.join(", ")}
                          </p>
                        ) : null}
                        {metaPixelValidation.invalid.length ? (
                          <p className="text-xs text-amber-700">
                            Invalid IDs: {metaPixelValidation.invalid.join(", ")}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-4 rounded-2xl border border-neutral-200 p-4">
                        <Toggle
                          label="Enable Google Analytics / Tag Manager"
                          description="Loads a GA4 measurement tag or GTM container once on every public page."
                          checked={googleTagManagerEnabled}
                          onChange={setGoogleTagManagerEnabled}
                        />
                        <AdminField label="Google Measurement or GTM ID">
                          <input
                            value={googleTagManagerId}
                            onChange={(e) => setGoogleTagManagerId(e.target.value)}
                            className={[
                              "w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-neutral-900",
                              googleTagManagerValid ? "border-neutral-200" : "border-amber-300 bg-amber-50",
                            ].join(" ")}
                            placeholder="G-XXXXXXXXXX or GTM-XXXXXXX"
                          />
                        </AdminField>
                        {!googleTagManagerValid ? (
                          <p className="text-xs text-amber-700">
                            Use a GA4 Measurement ID like G-ABC123XYZ or a GTM container ID like GTM-ABC123.
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-4 rounded-2xl border border-neutral-200 p-4">
                        <Toggle
                          label="Enable Microsoft Clarity"
                          description="Loads Clarity behavior analytics when an ID is present."
                          checked={microsoftClarityEnabled}
                          onChange={setMicrosoftClarityEnabled}
                        />
                        <AdminField label="Microsoft Clarity ID">
                          <input
                            value={microsoftClarityId}
                            onChange={(e) => setMicrosoftClarityId(e.target.value)}
                            className={[
                              "w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-neutral-900",
                              microsoftClarityValid ? "border-neutral-200" : "border-amber-300 bg-amber-50",
                            ].join(" ")}
                            placeholder="wowgqlkt86"
                          />
                        </AdminField>
                        {!microsoftClarityValid ? (
                          <p className="text-xs text-amber-700">
                            Use only letters, numbers, dashes, and underscores.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <AdminField label="Facebook domain verification">
                        <input
                          value={facebookDomainVerification}
                          onChange={(e) => setFacebookDomainVerification(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="verification-token"
                        />
                      </AdminField>
                      <AdminField label="Google site verification">
                        <input
                          value={googleSiteVerification}
                          onChange={(e) => setGoogleSiteVerification(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="google verification content value"
                        />
                      </AdminField>
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-950">Ecommerce events checklist</p>
                          <div className="mt-3 grid gap-2 text-sm text-emerald-900 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                              "View Content",
                              "Add to Cart",
                              "Begin Checkout",
                              "Purchase",
                            ].map((eventName) => (
                              <span key={eventName} className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {eventName}
                              </span>
                            ))}
                          </div>
                          <p className="mt-3 text-xs leading-5 text-emerald-800">
                            Existing Meta Pixel and Google ecommerce event helpers are preserved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "customCode" ? (
                <div className="space-y-6">
                  {siteMsg ? <Message>{siteMsg}</Message> : null}
                  <AdminCard
                    title="Custom code"
                    description="Advanced scripts are separated by placement to avoid confusion and reduce launch mistakes."
                    actions={
                      <PrimaryButton
                        onClick={() => saveSiteSettings("Custom code updated.")}
                        disabled={siteSaving}
                      >
                        {siteSaving ? "Saving..." : "Save custom code"}
                      </PrimaryButton>
                    }
                  >
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-neutral-200 p-4">
                        <Toggle
                          label="Enable custom head code"
                          description="Use only for snippets that must run inside document head."
                          checked={customHeadScriptsEnabled}
                          onChange={setCustomHeadScriptsEnabled}
                        />
                        <div className="mt-4">
                          <AdminField label="Custom head scripts" description="For meta tags, verification snippets, or scripts that must load in the document head.">
                            <textarea
                              value={customHeadScripts}
                              onChange={(e) => setCustomHeadScripts(e.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 font-mono text-xs outline-none focus:border-neutral-900"
                              rows={6}
                              placeholder="<meta name=&quot;example&quot; content=&quot;value&quot; />"
                            />
                          </AdminField>
                        </div>
                        {customScriptWarnings.head.length ? (
                          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                            {customScriptWarnings.head.map((warning) => (
                              <p key={warning}>{warning}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-2xl border border-neutral-200 p-4">
                        <Toggle
                          label="Enable custom body start code"
                          description="Use for snippets that must be placed immediately after body opens."
                          checked={customBodyStartScriptsEnabled}
                          onChange={setCustomBodyStartScriptsEnabled}
                        />
                        <div className="mt-4">
                          <AdminField label="Custom body start scripts" description="For noscript tags and snippets required at the top of body.">
                            <textarea
                              value={customBodyStartScripts}
                              onChange={(e) => setCustomBodyStartScripts(e.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 font-mono text-xs outline-none focus:border-neutral-900"
                              rows={6}
                              placeholder="<noscript>...</noscript>"
                            />
                          </AdminField>
                        </div>
                        {customScriptWarnings.bodyStart.length ? (
                          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                            {customScriptWarnings.bodyStart.map((warning) => (
                              <p key={warning}>{warning}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-2xl border border-neutral-200 p-4">
                        <Toggle
                          label="Enable custom body end code"
                          description="Use for scripts that can safely load after the page content."
                          checked={customBodyEndScriptsEnabled}
                          onChange={setCustomBodyEndScriptsEnabled}
                        />
                        <div className="mt-4">
                          <AdminField label="Custom body end scripts" description="For scripts that can load near the end of the body.">
                            <textarea
                              value={customBodyEndScripts}
                              onChange={(e) => setCustomBodyEndScripts(e.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 font-mono text-xs outline-none focus:border-neutral-900"
                              rows={6}
                              placeholder="<script>...</script>"
                            />
                          </AdminField>
                        </div>
                        {customScriptWarnings.bodyEnd.length ? (
                          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                            {customScriptWarnings.bodyEnd.map((warning) => (
                              <p key={warning}>{warning}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">Advanced area</p>
                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        Incorrect scripts can break tracking or frontend rendering. Keep client-facing instructions clear before adding custom snippets.
                      </p>
                    </div>
                  </AdminCard>
                </div>
              ) : null}

              {activeTab === "security" ? (
                <div className="space-y-6">
                  {securityMsg ? <Message>{securityMsg}</Message> : null}
                  <AdminCard
                    title="Admin security"
                    description="Update admin name, login email, or password. Current email is required for verification."
                    actions={
                      <PrimaryButton onClick={saveSecurity} disabled={securitySaving}>
                        {securitySaving ? "Saving..." : "Update security"}
                      </PrimaryButton>
                    }
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label="Current email" required>
                        <input
                          value={currentEmail}
                          onChange={(e) => setCurrentEmail(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="admin@yourstore.com"
                        />
                      </AdminField>
                      <AdminField label="Admin name">
                        <input
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="Admin"
                        />
                      </AdminField>
                      <AdminField label="New email">
                        <input
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="new-admin@yourstore.com"
                        />
                      </AdminField>
                      <AdminField label="New password">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          placeholder="********"
                        />
                      </AdminField>
                    </div>
                  </AdminCard>
                </div>
              ) : null}
            </AdminSection>
          </main>
        </div>
      </div>
    </div>
  );
}
