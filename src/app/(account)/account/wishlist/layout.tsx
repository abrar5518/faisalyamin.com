const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Wishlist",
  description: "View and manage your saved LuxStore items.",
  alternates: { canonical: `${baseUrl}/account/wishlist` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
