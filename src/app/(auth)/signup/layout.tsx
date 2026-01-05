const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Sign Up",
  description: "Create your LuxStore account to track orders and manage settings.",
  alternates: { canonical: `${baseUrl}/signup` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
