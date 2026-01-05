const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Login",
  description: "Sign in to manage your account, orders, and settings.",
  alternates: { canonical: `${baseUrl}/login` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
