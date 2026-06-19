import path from "path";

const DEFAULT_UPLOAD_PUBLIC_PATH = "/uploads";
const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function cleanPublicPath(input?: string | null) {
  const value = (input || DEFAULT_UPLOAD_PUBLIC_PATH).trim();
  if (!value) return DEFAULT_UPLOAD_PUBLIC_PATH;
  return value.startsWith("/") ? value.replace(/\/+$/, "") : `/${value.replace(/\/+$/, "")}`;
}

export function getUploadPublicPath() {
  return cleanPublicPath(process.env.UPLOAD_PUBLIC_PATH);
}

export function getUploadRootDir() {
  const configured = process.env.UPLOAD_DIR?.trim();
  return configured ? path.resolve(configured) : DEFAULT_UPLOAD_DIR;
}

export function getUploadKindDir(kind: string) {
  return path.join(getUploadRootDir(), kind);
}

export function getUploadPublicUrl(kind: string, fileName: string) {
  return `${getUploadPublicPath()}/${kind}/${fileName}`;
}
