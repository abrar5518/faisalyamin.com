export type TrackingValidationResult = {
  valid: string[];
  invalid: string[];
};

export type CustomScriptWarnings = {
  head: string[];
  bodyStart: string[];
  bodyEnd: string[];
};

const MAX_CUSTOM_SCRIPT_HTML_LENGTH = 20000;
const META_PIXEL_PATTERN = /^\d{5,30}$/;
const GTM_PATTERN = /^GTM-[A-Z0-9]+$/i;
const CLARITY_PATTERN = /^[a-z0-9_-]{5,80}$/i;
const DISALLOWED_CUSTOM_TAG_PATTERN =
  /<\/?(?:base|embed|form|frame|frameset|input|object|textarea)[^>]*>/gi;
const EVENT_HANDLER_ATTRIBUTE_PATTERN = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL_PATTERN = /\s+(?:href|src|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi;

function testPattern(pattern: RegExp, value: string) {
  pattern.lastIndex = 0;
  return pattern.test(value);
}

export function splitTrackingIds(value?: string | null) {
  return (value ?? "")
    .split(/[\s,;]+/)
    .map((id) => id.trim())
    .filter(Boolean);
}

export function uniqueValues(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function validateMetaPixelIds(value?: string | null): TrackingValidationResult {
  const ids = splitTrackingIds(value);
  return {
    valid: uniqueValues(ids.filter((id) => META_PIXEL_PATTERN.test(id))),
    invalid: ids.filter((id) => !META_PIXEL_PATTERN.test(id)),
  };
}

export function sanitizeMetaPixelIds(value?: string | null) {
  return validateMetaPixelIds(value).valid;
}

export function isValidGoogleTagManagerId(value?: string | null) {
  const token = value?.trim();
  return Boolean(token && GTM_PATTERN.test(token));
}

export function sanitizeGoogleTagManagerId(value?: string | null) {
  const token = value?.trim();
  return token && isValidGoogleTagManagerId(token) ? token.toUpperCase() : "";
}

export function isValidMicrosoftClarityId(value?: string | null) {
  const token = value?.trim();
  return Boolean(token && CLARITY_PATTERN.test(token));
}

export function sanitizeMicrosoftClarityId(value?: string | null) {
  const token = value?.trim();
  return token && isValidMicrosoftClarityId(token) ? token : "";
}

export function getTrackingStatus(value: boolean | undefined | null, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

export function sanitizeCustomScriptHtml(value?: string | null) {
  const html = value?.trim();
  if (!html) return "";

  return html
    .slice(0, MAX_CUSTOM_SCRIPT_HTML_LENGTH)
    .replace(/\0/g, "")
    .replace(DISALLOWED_CUSTOM_TAG_PATTERN, "")
    .replace(EVENT_HANDLER_ATTRIBUTE_PATTERN, "")
    .replace(JAVASCRIPT_URL_PATTERN, "");
}

function scriptWarningsFor(value?: string | null) {
  const html = value?.trim();
  if (!html) return [];

  const warnings: string[] = [];
  const lower = html.toLowerCase();
  if (lower.includes("googletagmanager.com/gtm.js") || lower.includes("gtm-")) {
    warnings.push("GTM snippet detected. Use Google Tag Manager ID field to avoid duplicate GTM loading.");
  }
  if (lower.includes("connect.facebook.net") || lower.includes("fbq(") || lower.includes("facebook.com/tr")) {
    warnings.push("Meta Pixel snippet detected. Use Meta Pixel IDs field to avoid duplicate Pixel events.");
  }
  if (lower.includes("clarity.ms/tag") || lower.includes("clarity(")) {
    warnings.push("Microsoft Clarity snippet detected. Use Clarity ID field to avoid duplicate Clarity loading.");
  }
  if ((html.match(/<script\b/gi) ?? []).length > 3) {
    warnings.push("Multiple script tags found. Keep only required snippets for faster checkout and product pages.");
  }
  if (html.length > MAX_CUSTOM_SCRIPT_HTML_LENGTH) {
    warnings.push("Snippet is very large. It will be limited before rendering to protect performance.");
  }
  if (testPattern(DISALLOWED_CUSTOM_TAG_PATTERN, html)) {
    warnings.push("Potentially unsafe form/object/embed tags detected. They will be removed before rendering.");
  }
  if (
    testPattern(EVENT_HANDLER_ATTRIBUTE_PATTERN, html) ||
    testPattern(JAVASCRIPT_URL_PATTERN, html)
  ) {
    warnings.push("Inline event handlers or javascript: URLs detected. They will be removed before rendering.");
  }

  return warnings;
}

export function getCustomScriptWarnings(input: {
  head?: string | null;
  bodyStart?: string | null;
  bodyEnd?: string | null;
}): CustomScriptWarnings {
  return {
    head: scriptWarningsFor(input.head),
    bodyStart: scriptWarningsFor(input.bodyStart),
    bodyEnd: scriptWarningsFor(input.bodyEnd),
  };
}
