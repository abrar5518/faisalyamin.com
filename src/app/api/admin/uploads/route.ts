import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import path from "path";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";

const UploadSchema = z.object({
  dataUrl: z.string().min(20),
  kind: z.enum(["category", "subcategory", "product", "blog", "branding"]).optional(),
  filename: z.string().min(1).optional(),
});

function getExtensionFromMime(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "";
  }
}

function cleanBaseName(input?: string | null) {
  const rawName = (input || "upload").replace(/\.[^/.]+$/, "");
  return rawName.replace(/[^a-zA-Z0-9_-]/g, "") || "upload";
}

function uniqueFileName(input: string | undefined | null, ext: string) {
  const safeBase = cleanBaseName(input);
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${safeBase}-${Date.now()}-${randomUUID().slice(0, 8)}.${safeExt}`;
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const allowedKinds = new Set(["category", "subcategory", "product", "blog", "branding"]);
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const rawKind = String(form.get("kind") || "product");
      const kind = allowedKinds.has(rawKind) ? rawKind : "product";

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ ok: false, error: "File is required" }, { status: 400 });
      }

      const extFromMime = getExtensionFromMime(file.type || "");
      const ext = extFromMime || path.extname(file.name || "").replace(".", "");

      if (!ext) {
        return NextResponse.json({ ok: false, error: "Unsupported image type" }, { status: 400 });
      }

      const fileName = uniqueFileName(file.name, ext);
      const uploadDir = path.join("/var/www/sahoolat-uploads", kind);
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        ok: true,
        data: { url: `/uploads/${kind}/${fileName}` },
      });
    }

    const body = await req.json();
    const data = UploadSchema.parse(body);

    const match = /^data:([^;]+);base64,(.+)$/.exec(data.dataUrl);
    if (!match) {
      return NextResponse.json({ ok: false, error: "Invalid data URL" }, { status: 400 });
    }

    const mime = match[1];
    const base64 = match[2];
    const ext = getExtensionFromMime(mime);
    if (!ext) {
      return NextResponse.json({ ok: false, error: "Unsupported image type" }, { status: 400 });
    }

    const kind = allowedKinds.has(data.kind ?? "") ? (data.kind as string) : "product";
    const fileName = uniqueFileName(data.filename, ext);

    const uploadDir = path.join("/var/www/sahoolat-uploads", kind);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, Buffer.from(base64, "base64"));

    return NextResponse.json({
      ok: true,
      data: { url: `/uploads/${kind}/${fileName}` },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("POST /api/admin/uploads error:", err);
    return NextResponse.json({ ok: false, error: "Failed to upload image" }, { status: 500 });
  }
}
