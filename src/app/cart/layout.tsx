const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Cart",
  description: "Review items in your cart and proceed to checkout.",
  alternates: { canonical: `${baseUrl}/cart` },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
