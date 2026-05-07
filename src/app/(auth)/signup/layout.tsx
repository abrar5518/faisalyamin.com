import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Sign Up",
  description: "Create your Sahoolat account to track orders and manage settings.",
  alternates: { canonical: `${baseUrl}/signup` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
