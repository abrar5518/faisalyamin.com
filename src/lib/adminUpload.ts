import { Fetch } from "@/lib/fetch";

export async function uploadImage(file: File, kind: string = "product"): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);

  const res = await Fetch<{ url: string }>("/api/admin/uploads", {
    method: "POST",
    auth: true,
    data: form,
  });

  if (!res.ok) {
    throw new Error(res.error || "Upload failed");
  }

  return res.data as { url: string };
}
