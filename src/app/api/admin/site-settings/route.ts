import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { z } from "zod";

const SiteSettingsSchema = z.object({
  siteName: z.string().optional().nullable(),
  siteUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  logoAlt: z.string().optional().nullable(),
  siteIconUrl: z.string().optional().nullable(),
  siteIconAlt: z.string().optional().nullable(),
  siteFooterText: z.string().optional().nullable(),
  metaPixelEnabled: z.boolean().optional(),
  metaPixelIds: z.string().optional().nullable(),
  facebookDomainVerification: z.string().optional().nullable(),
  googleSiteVerification: z.string().optional().nullable(),
  googleTagManagerEnabled: z.boolean().optional(),
  googleTagManagerId: z.string().optional().nullable(),
  microsoftClarityEnabled: z.boolean().optional(),
  microsoftClarityId: z.string().optional().nullable(),
  customHeadScriptsEnabled: z.boolean().optional(),
  customHeadScripts: z.string().optional().nullable(),
  customBodyStartScriptsEnabled: z.boolean().optional(),
  customBodyStartScripts: z.string().optional().nullable(),
  customBodyEndScriptsEnabled: z.boolean().optional(),
  customBodyEndScripts: z.string().optional().nullable(),
  headerMenuItems: z.string().optional().nullable(),
  headerSearchPlaceholder: z.string().optional().nullable(),
  headerAnnouncementEnabled: z.boolean().optional(),
  headerAnnouncementText: z.string().optional().nullable(),
  headerAnnouncementHref: z.string().optional().nullable(),
  headerShowSearch: z.boolean().optional(),
  headerShowAccount: z.boolean().optional(),
  headerShowCart: z.boolean().optional(),
  headerShowSupportLinks: z.boolean().optional(),
  footerCopyright: z.string().optional().nullable(),
  footerColumns: z.string().optional().nullable(),
  footerNewsletterEnabled: z.boolean().optional(),
  footerNewsletterEyebrow: z.string().optional().nullable(),
  footerNewsletterTitle: z.string().optional().nullable(),
  footerNewsletterSubtitle: z.string().optional().nullable(),
  footerNewsletterConsentText: z.string().optional().nullable(),
  footerTrustItems: z.string().optional().nullable(),
  footerSocialLinks: z.string().optional().nullable(),
  globalCopy: z.string().optional().nullable(),
  checkoutSettings: z.string().optional().nullable(),
  cartSettings: z.string().optional().nullable(),
  catalogSettings: z.string().optional().nullable(),
  themeSettings: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: settings });
  } catch (err) {
    console.error("GET /api/admin/site-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch site settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = SiteSettingsSchema.parse(body);

    const existing = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
    const updated = existing
      ? await prisma.siteSettings.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.siteSettings.create({ data });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("PUT /api/admin/site-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update site settings" }, { status: 500 });
  }
}
