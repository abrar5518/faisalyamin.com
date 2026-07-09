import { randomUUID } from "crypto";
import path from "path";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getUploadKindDir, getUploadPublicUrl } from "@/lib/uploadStorage";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const UPLOAD_KIND = "customization";

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

function isFileLike(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value
  );
}

function cleanBaseName(input?: string | null) {
  const rawName = (input || "print-file").replace(/\.[^/.]+$/, "");
  return rawName.replace(/[^a-zA-Z0-9_-]/g, "") || "print-file";
}

function uniqueFileName(input: string | undefined | null, ext: string) {
  const safeBase = cleanBaseName(input);
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${safeBase}-${Date.now()}-${randomUUID().slice(0, 8)}.${safeExt}`;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!isFileLike(file)) {
      return NextResponse.json({ ok: false, error: "File is required" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "File is too large. Maximum allowed size is 8MB." },
        { status: 413 }
      );
    }

    const extFromMime = getExtensionFromMime(file.type || "");
    const ext = extFromMime || path.extname(file.name || "").replace(".", "").toLowerCase();
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return NextResponse.json({ ok: false, error: "Please upload JPG, PNG, WEBP, or GIF." }, { status: 400 });
    }

    const fileName = uniqueFileName(file.name, ext === "jpeg" ? "jpg" : ext);
    const uploadDir = getUploadKindDir(UPLOAD_KIND);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      ok: true,
      data: {
        url: getUploadPublicUrl(UPLOAD_KIND, fileName),
        filename: file.name || fileName,
      },
    });
  } catch (err) {
    console.error("POST /api/customization-uploads error:", err);
    return NextResponse.json({ ok: false, error: "Failed to upload file" }, { status: 500 });
  }
}
