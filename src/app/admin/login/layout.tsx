import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Admin Login",
  description: "Admin access for store staff.",
  alternates: { canonical: `${baseUrl}/admin/login` },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
