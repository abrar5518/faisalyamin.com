import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Forgot Password",
  description: "Reset your Faisal Yamin account password securely.",
  alternates: { canonical: `${baseUrl}/forgot-password` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
