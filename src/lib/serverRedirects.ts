import { permanentRedirect, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeRedirectSource } from "@/lib/redirects";

export async function redirectIfManaged(source: string) {
  const normalizedSource = normalizeRedirectSource(source);
  if (!normalizedSource || normalizedSource === "/") return;

  const rule = await prisma.redirectRule.findFirst({
    where: { source: normalizedSource, isActive: true },
    select: { destination: true, permanent: true },
  });

  if (rule?.destination) {
    if (rule.permanent) {
      permanentRedirect(rule.destination);
    }
    redirect(rule.destination);
  }
}
