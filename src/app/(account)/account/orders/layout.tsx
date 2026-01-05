const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Orders",
  description: "Track your LuxStore orders and delivery status.",
  alternates: { canonical: `${baseUrl}/account/orders` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
