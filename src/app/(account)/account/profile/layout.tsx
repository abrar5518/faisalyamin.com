import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Profile",
  description: "Manage your LuxStore profile details.",
  alternates: { canonical: `${baseUrl}/account/profile` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
