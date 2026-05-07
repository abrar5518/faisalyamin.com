import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Security",
  description: "Update your password and secure your account.",
  alternates: { canonical: `${baseUrl}/account/security` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
