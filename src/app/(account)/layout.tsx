// src/app/(account)/layout.tsx
import AccountSidebar from "@/components/account/AccountSidebar";
import AccountHeader from "@/components/account/AccountHeader";
import AccountGuard from "@/components/account/AccountGuard";
import Link from "next/link";

export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Top bar */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center justify-between text-xs text-neutral-600">
            <p>Account area</p>
            <div className="flex items-center gap-4">
              <a className="hover:text-neutral-900" href="/contact">
                Support
              </a>
              <Link className="hover:text-neutral-900" href="/account/orders">
                Track Order
              </Link>
              <a className="hover:text-neutral-900" href="/logout">
                Logout
              </a>
            </div>
          </div>
        </Container>
      </div>

      <main className="py-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3">
              <AccountSidebar />
            </div>

            {/* Main */}
            <div className="lg:col-span-8 xl:col-span-9">
              <AccountHeader />
              <div className="mt-6">
                <AccountGuard>{children}</AccountGuard>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}

