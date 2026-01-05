// src/app/admin/(panel)/dashboard/page.tsx
import AdminTopbar from "@/components/admin/AdminTopbar";
import StatCard from "@/components/admin/StatCard";
import { Table } from "@/components/admin/Table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid (Legacy)",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    READY_TO_SHIP: "Ready to Ship",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };
  return statusMap[status] || status;
}

function getStatusColor(status: string): string {
  if (status.includes("Delivered")) return "bg-green-100 text-green-800";
  if (status.includes("Shipped") || status.includes("Delivery")) return "bg-blue-100 text-blue-800";
  if (status.includes("Processing") || status.includes("Confirmed")) return "bg-purple-100 text-purple-800";
  if (status.includes("Pending")) return "bg-yellow-100 text-yellow-800";
  if (status.includes("Cancelled") || status.includes("Refunded")) return "bg-red-100 text-red-800";
  return "bg-neutral-100 text-neutral-800";
}

export default async function AdminDashboardPage() {
  // Fetch real data from database
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Revenue (last 30 days)
  const revenueData = await prisma.order.aggregate({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: { notIn: ["CANCELLED", "REFUNDED"] },
    },
    _sum: { total: true },
  });
  const revenue = Number(revenueData._sum.total || 0);

  // Pending orders count
  const pendingCount = await prisma.order.count({
    where: {
      status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] },
    },
  });

  // Total counts
  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  const totalCategories = await prisma.category.count();
  const totalSubcategories = await prisma.subcategory.count();
  const totalBlogs = await prisma.blog.count();

  // Recent orders (last 5)
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  const metrics = [
    { 
      label: "Revenue (30 days)", 
      value: `PKR ${revenue.toLocaleString()}`, 
      hint: "Includes COD + online" 
    },
    { 
      label: "Orders Pending", 
      value: String(pendingCount), 
      hint: "Need confirmation / packing" 
    },
    { 
      label: "Total Products", 
      value: String(totalProducts), 
      hint: "Active products" 
    },
    { 
      label: "Categories", 
      value: String(totalCategories), 
      hint: `${totalSubcategories} subcategories` 
    },
  ];

  const recent = recentOrders.map((order) => ({
    id: String(order.id),
    customer: order.customer?.name || "Guest",
    total: `PKR ${Number(order.total).toLocaleString()}`,
    status: formatStatus(order.status),
  }));

  return (
    <div className="bg-white">
      <AdminTopbar title="Dashboard" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <StatCard key={m.label} label={m.label} value={m.value} hint={m.hint} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Recent orders</p>
              <Link 
                href="/admin/orders" 
                className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
              >
                View all →
              </Link>
            </div>
            <Table
              headers={["Order", "Customer", "Total", "Status"]}
              rows={recent.map((r) => [
                <Link 
                  key={r.id} 
                  href={`/admin/orders/${r.id}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  #{r.id}
                </Link>,
                <span key={r.customer} className="text-neutral-700">{r.customer}</span>,
                <span key={r.total} className="font-medium">{r.total}</span>,
                <span
                  key={r.status}
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(r.status)}`}
                >
                  {r.status}
                </span>,
              ])}
            />
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-sm font-semibold">Quick Stats</p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Total Blogs</span>
                  <span className="font-semibold text-neutral-900">{totalBlogs}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Subcategories</span>
                  <span className="font-semibold text-neutral-900">{totalSubcategories}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Active Products</span>
                  <span className="font-semibold text-neutral-900">{totalProducts}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                <Link 
                  href="/admin/products/create" 
                  className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Add product
                </Link>
                <Link
                  href="/admin/orders"
                  className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
                >
                  View orders
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
