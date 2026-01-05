const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Settings",
  description: "Update preferences and account settings.",
  alternates: { canonical: `${baseUrl}/account/settings` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
