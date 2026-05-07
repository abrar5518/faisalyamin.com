import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Addresses",
  description: "Manage saved delivery addresses for your Sahoolat account.",
  alternates: { canonical: `${baseUrl}/account/addresses` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
