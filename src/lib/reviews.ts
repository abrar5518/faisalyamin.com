import { prisma } from "@/lib/prisma";

export async function recomputeProductRating(productId: number) {
  const rows = await prisma.productReview.findMany({
    where: { productId, status: "APPROVED" },
    select: { rating: true },
  });

  const count = rows.length;
  const avg = count ? rows.reduce((sum, r) => sum + (r.rating || 0), 0) / count : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Number(avg.toFixed(2)),
      reviewsCount: count,
    },
  });
}
