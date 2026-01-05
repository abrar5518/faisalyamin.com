const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your LuxStore account password securely.",
  alternates: { canonical: `${baseUrl}/forgot-password` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
