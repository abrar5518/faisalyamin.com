const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "Admin",
  description: "Admin area for LuxStore staff.",
  alternates: { canonical: `${baseUrl}/admin` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-neutral-900">{children}</div>;
}
