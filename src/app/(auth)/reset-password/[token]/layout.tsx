import { normalizeSiteUrl } from "@/lib/siteUrl";

type LayoutProps = {
  params: Promise<{ token: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: LayoutProps) {
  const { token } = await params;
  const baseUrl = normalizeSiteUrl();
  return {
    title: "Reset Password",
    description: "Set a new password for your Sahoolat account.",
    alternates: { canonical: `${baseUrl}/reset-password/${token}` },
  };
}

export default function ResetPasswordLayout({ children }: LayoutProps) {
  return children;
}
