const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Checkout",
  description: "Complete your purchase with secure checkout and fast delivery.",
  alternates: { canonical: `${baseUrl}/checkout` },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
