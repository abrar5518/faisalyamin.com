const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Security",
  description: "Update your password and secure your account.",
  alternates: { canonical: `${baseUrl}/account/security` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
