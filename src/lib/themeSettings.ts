import type { CSSProperties } from "react";

export type ThemeFontChoice = "classic" | "modern" | "system";

export type ThemeSettings = {
  primaryColor: string;
  primaryHoverColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  buttonRadius: number;
  cardRadius: number;
  fontChoice: ThemeFontChoice;
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  primaryColor: "#111111",
  primaryHoverColor: "#262626",
  secondaryColor: "#f5f5f5",
  accentColor: "#0f766e",
  backgroundColor: "#ffffff",
  surfaceColor: "#fafafa",
  textColor: "#111111",
  mutedTextColor: "#525252",
  borderColor: "#e5e5e5",
  buttonRadius: 16,
  cardRadius: 24,
  fontChoice: "classic",
};

const COLOR_KEYS: Array<keyof Pick<
  ThemeSettings,
  | "primaryColor"
  | "primaryHoverColor"
  | "secondaryColor"
  | "accentColor"
  | "backgroundColor"
  | "surfaceColor"
  | "textColor"
  | "mutedTextColor"
  | "borderColor"
>> = [
  "primaryColor",
  "primaryHoverColor",
  "secondaryColor",
  "accentColor",
  "backgroundColor",
  "surfaceColor",
  "textColor",
  "mutedTextColor",
  "borderColor",
];

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim());
}

function clampRadius(value: unknown, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(32, Math.round(n)));
}

export function parseThemeSettings(value?: string | null): ThemeSettings {
  if (!value?.trim()) return DEFAULT_THEME_SETTINGS;

  try {
    const parsed = JSON.parse(value) as Partial<ThemeSettings>;
    const next: ThemeSettings = { ...DEFAULT_THEME_SETTINGS };

    for (const key of COLOR_KEYS) {
      const incoming = parsed[key];
      if (isHexColor(incoming)) next[key] = incoming.trim();
    }

    next.buttonRadius = clampRadius(parsed.buttonRadius, DEFAULT_THEME_SETTINGS.buttonRadius);
    next.cardRadius = clampRadius(parsed.cardRadius, DEFAULT_THEME_SETTINGS.cardRadius);
    next.fontChoice =
      parsed.fontChoice === "modern" || parsed.fontChoice === "system" || parsed.fontChoice === "classic"
        ? parsed.fontChoice
        : DEFAULT_THEME_SETTINGS.fontChoice;

    return next;
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

export function serializeThemeSettings(settings: ThemeSettings) {
  const clean = parseThemeSettings(JSON.stringify(settings));
  return JSON.stringify(clean);
}

export function themeSettingsToCssVars(settings: ThemeSettings): CSSProperties {
  const headingFont =
    settings.fontChoice === "modern"
      ? "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
      : settings.fontChoice === "system"
        ? "ui-sans-serif, system-ui, sans-serif"
        : "var(--font-playfair), Georgia, serif";
  const bodyFont =
    settings.fontChoice === "system"
      ? "ui-sans-serif, system-ui, sans-serif"
      : "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

  return {
    "--brand-bg": settings.backgroundColor,
    "--brand-text": settings.textColor,
    "--brand-muted-text": settings.mutedTextColor,
    "--brand-border": settings.borderColor,
    "--brand-surface": settings.surfaceColor,
    "--brand-primary": settings.primaryColor,
    "--brand-primary-hover": settings.primaryHoverColor,
    "--brand-secondary": settings.secondaryColor,
    "--brand-accent": settings.accentColor,
    "--brand-radius-button": `${settings.buttonRadius}px`,
    "--brand-radius-card": `${settings.cardRadius}px`,
    "--brand-font-body": bodyFont,
    "--brand-font-heading": headingFont,
    "--color-brand-bg": settings.backgroundColor,
    "--color-brand-text": settings.textColor,
    "--color-brand-primary": settings.primaryColor,
  } as CSSProperties;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const values = [r, g, b].map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

export function contrastRatio(a: string, b: string) {
  if (!isHexColor(a) || !isHexColor(b)) return 1;
  const lighter = Math.max(luminance(a), luminance(b));
  const darker = Math.min(luminance(a), luminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

export function getThemeWarnings(settings: ThemeSettings) {
  const warnings: string[] = [];
  if (contrastRatio(settings.backgroundColor, settings.textColor) < 4.5) {
    warnings.push("Background and text contrast is low. Use darker text or a lighter background.");
  }
  if (contrastRatio(settings.primaryColor, "#ffffff") < 4.5) {
    warnings.push("Primary color may be hard to read with white button text.");
  }
  if (contrastRatio(settings.surfaceColor, settings.textColor) < 4.5) {
    warnings.push("Card surface and text contrast is low.");
  }
  return warnings;
}
