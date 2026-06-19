import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  applyGenericOnboardingTemplate,
  getOnboardingSummary,
} from "@/lib/onboardingChecklist";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const summary = await getOnboardingSummary();
    return NextResponse.json({ ok: true, data: summary });
  } catch (error) {
    console.error("GET /api/admin/onboarding error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load onboarding checklist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (body?.action !== "apply-generic-template") {
      return NextResponse.json({ ok: false, error: "Unknown onboarding action" }, { status: 400 });
    }

    const summary = await applyGenericOnboardingTemplate();
    return NextResponse.json({ ok: true, data: summary });
  } catch (error) {
    console.error("POST /api/admin/onboarding error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to apply onboarding template" },
      { status: 500 }
    );
  }
}
