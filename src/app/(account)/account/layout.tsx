import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Account",
  description: "Manage your LuxStore account, orders, and preferences.",
  alternates: { canonical: `${baseUrl}/account` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
