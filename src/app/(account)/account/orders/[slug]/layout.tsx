import { normalizeSiteUrl } from "@/lib/siteUrl";

type LayoutProps = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: LayoutProps) {
  const { slug } = await params;
  const baseUrl = normalizeSiteUrl();
  return {
    title: "Order Details",
    description: "View order details and delivery updates.",
    alternates: { canonical: `${baseUrl}/account/orders/${slug}` },
  };
}

export default function OrderDetailLayout({ children }: LayoutProps) {
  return children;
}
