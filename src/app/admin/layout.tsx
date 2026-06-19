import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Admin",
  description: "Admin area for store staff.",
  alternates: { canonical: `${baseUrl}/admin` },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-neutral-900">{children}</div>;
}
