const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Account",
  description: "Manage your LuxStore account, orders, and preferences.",
  alternates: { canonical: `${baseUrl}/account` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
