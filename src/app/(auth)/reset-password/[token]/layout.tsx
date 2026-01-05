type LayoutProps = {
  params: Promise<{ token: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: LayoutProps) {
  const { token } = await params;
  const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";
  return {
    title: "Reset Password",
    description: "Set a new password for your LuxStore account.",
    alternates: { canonical: `${baseUrl}/reset-password/${token}` },
  };
}

export default function ResetPasswordLayout({ children }: LayoutProps) {
  return children;
}
