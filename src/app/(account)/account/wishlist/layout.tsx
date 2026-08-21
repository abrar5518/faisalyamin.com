import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata = {
  title: "Wishlist",
  description: "View and manage your saved Faisal Yamin items.",
  alternates: { canonical: `${baseUrl}/account/wishlist` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
