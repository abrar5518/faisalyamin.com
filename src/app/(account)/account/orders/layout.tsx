import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Orders",
  description: "Track your Faisal Yamin orders and delivery status.",
  alternates: { canonical: `${baseUrl}/account/orders` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
