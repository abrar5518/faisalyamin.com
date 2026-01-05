const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Admin Login",
  description: "Admin access for LuxStore staff.",
  alternates: { canonical: `${baseUrl}/admin/login` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
