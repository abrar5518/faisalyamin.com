const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Addresses",
  description: "Manage saved delivery addresses for your LuxStore account.",
  alternates: { canonical: `${baseUrl}/account/addresses` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
