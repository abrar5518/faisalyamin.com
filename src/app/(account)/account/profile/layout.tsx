const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Profile",
  description: "Manage your LuxStore profile details.",
  alternates: { canonical: `${baseUrl}/account/profile` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
