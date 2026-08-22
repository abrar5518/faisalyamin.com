import { withResponsiveTables } from "@/lib/richText";

type ManagedPageBodyProps = {
  page?: {
    contentHtml?: string | null;
  } | null;
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default function ManagedPageBody({ page }: ManagedPageBodyProps) {
  if (!page?.contentHtml?.trim()) return null;

  return (
    <section className="ma-managed-section">
      <Container>
        <div
          className="ma-managed-content rt-content"
          dangerouslySetInnerHTML={{ __html: withResponsiveTables(page.contentHtml) }}
        />
      </Container>
    </section>
  );
}
