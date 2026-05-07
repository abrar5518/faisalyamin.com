import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Settings",
  description: "Update preferences and account settings.",
  alternates: { canonical: `${baseUrl}/account/settings` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
