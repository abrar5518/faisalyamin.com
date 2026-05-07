import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Forgot Password",
  description: "Reset your Sahoolat account password securely.",
  alternates: { canonical: `${baseUrl}/forgot-password` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
