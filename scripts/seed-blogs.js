const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const posts = [
  {
    slug: "how-to-buy-luxury-watch-pakistan",
    title: "How to Buy a Luxury Watch in Pakistan: A Practical Guide",
    excerpt: "A clear checklist for authenticity, pricing, and condition so you can buy confidently.",
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    contentHtml: "<h2>Start with authenticity</h2><p>Verify serials, paperwork, and movement condition before looking at price.</p><h2>Know fair pricing</h2><p>Compare recent sales, not just listings, to avoid inflated offers.</p><h2>Condition report matters</h2><p>Ask for high-resolution photos and service history for high-value pieces.</p>",
    metaTitle: "Buy Luxury Watches in Pakistan - Authenticity Guide",
    metaDescription: "Learn how to buy luxury watches in Pakistan with verified authenticity, fair pricing, and condition checks.",
    metaKeywords: "luxury watches pakistan, buy rolex pakistan, authenticity checklist",
  },
  {
    slug: "rolex-datejust-vs-submariner",
    title: "Rolex Datejust vs Submariner: Which One Fits Your Lifestyle?",
    excerpt: "Two icons, two personalities. Compare wearability, value retention, and versatility.",
    coverImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    contentHtml: "<h2>Daily wear</h2><p>Datejust is versatile and elegant; Submariner leans sporty and durable.</p><h2>Value retention</h2><p>Both retain value, but certain Submariner references lead on resale.</p><h2>Final pick</h2><p>Choose based on your lifestyle and wrist comfort.</p>",
    metaTitle: "Rolex Datejust vs Submariner - Comparison",
    metaDescription: "A clean comparison between Rolex Datejust and Submariner to help you choose the right watch.",
    metaKeywords: "rolex datejust vs submariner, rolex comparison, luxury watch guide",
  },
  {
    slug: "how-to-spot-fake-watches",
    title: "How to Spot a Fake Luxury Watch: 9 Practical Signs",
    excerpt: "A real-world checklist that catches most common fakes before you spend serious money.",
    coverImage: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
    contentHtml: "<h2>Check the dial</h2><p>Misaligned text, uneven spacing, and rough edges are red flags.</p><h2>Inspect engravings</h2><p>Serials should be crisp and consistent with brand standards.</p><h2>Ask for timegrapher results</h2><p>Movement accuracy is a strong indicator of authenticity.</p>",
    metaTitle: "Spot Fake Watches - 9 Signs",
    metaDescription: "Learn 9 practical signs to identify fake luxury watches before you buy.",
    metaKeywords: "fake watch signs, watch authenticity, luxury watch checklist",
  },
  {
    slug: "omega-speedmaster-buying-guide",
    title: "Omega Speedmaster Buying Guide: References, Pricing, and Condition",
    excerpt: "Everything you need to know before buying a Speedmaster, from references to condition tips.",
    coverImage: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
    contentHtml: "<h2>Know the references</h2><p>Moonwatch variants differ by year and movement.</p><h2>Pricing ranges</h2><p>Compare listings with actual recent sales.</p><h2>Condition checklist</h2><p>Inspect crystal, bezel, and lume consistency.</p>",
    metaTitle: "Omega Speedmaster Buying Guide",
    metaDescription: "A practical guide to Omega Speedmaster references, pricing, and condition checks.",
    metaKeywords: "omega speedmaster, speedmaster guide, omega pricing",
  },
  {
    slug: "best-selling-luxury-watches-2025",
    title: "Top Best-Selling Luxury Watches This Season",
    excerpt: "Trending references buyers cannot stop talking about, and why demand keeps rising.",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    contentHtml: "<h2>Top references</h2><p>Rolex, Patek, and AP continue to dominate demand.</p><h2>Why demand is rising</h2><p>Limited production and global interest keep prices firm.</p><h2>What to watch next</h2><p>Emerging models with strong collector interest.</p>",
    metaTitle: "Best Selling Luxury Watches 2025",
    metaDescription: "Discover the best-selling luxury watches this season and the trends behind demand.",
    metaKeywords: "best selling watches, luxury watch trends, 2025 watches",
  },
  {
    slug: "watch-care-maintenance-basics",
    title: "Watch Care and Maintenance Basics for Long-Term Value",
    excerpt: "Keep your watch performing and retaining value with simple, practical care steps.",
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    contentHtml: "<h2>Daily care</h2><p>Wipe after wear and store in a dry, safe case.</p><h2>Service intervals</h2><p>Plan servicing every 4-6 years depending on the brand.</p><h2>Water resistance</h2><p>Check seals regularly to avoid moisture damage.</p>",
    metaTitle: "Watch Maintenance and Care Basics",
    metaDescription: "Simple care and maintenance tips to protect your luxury watch and its value.",
    metaKeywords: "watch maintenance, watch care tips, luxury watch service",
  },
];

async function main() {
  for (const post of posts) {
    await prisma.blog.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        contentHtml: post.contentHtml,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        metaKeywords: post.metaKeywords,
        isPublished: true,
        publishedAt: new Date(),
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        contentHtml: post.contentHtml,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        metaKeywords: post.metaKeywords,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
