const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const image = (url, alt, sortOrder) => ({ url, alt, mediaType: "image", sortOrder });

const products = [
  {
    category: "women", name: "Sculpted Camel Wool Coat", slug: "sculpted-camel-wool-coat", brand: "Faisal Yamin Atelier", sku: "FYA-WC-001", price: 22900, compareAt: 26900, badge: "New Season", rating: 4.9, reviewsCount: 38,
    shortDesc: "A softly structured wool-blend coat with a sculpted waist, clean lapels and an elegant below-knee length.",
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [
      { id: "camel", label: "Warm Camel", colorCode: "#b48a62", images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1400&q=90"] },
      { id: "forest", label: "Deep Forest", colorCode: "#29443b", images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=90"] },
      { id: "black", label: "Black", colorCode: "#171717", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=90"] },
    ],
    images: [
      image("https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1400&q=90", "Woman wearing a sculpted camel wool coat", 0),
      image("https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90", "Editorial styling of a neutral women’s coat", 1),
      image("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90", "Premium neutral garments on a clothing rail", 2),
      image("https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=90", "Curated women’s wardrobe details", 3),
    ],
  },
  {
    category: "women", name: "Leather Studio Biker Jacket", slug: "leather-studio-biker-jacket", brand: "Faisal Yamin Atelier", sku: "FYA-LJ-002", price: 28900, compareAt: 32900, badge: "Bestseller", rating: 4.8, reviewsCount: 64,
    shortDesc: "A premium studio biker jacket with asymmetric hardware, a refined cropped shape and supple leather-look finish.", sizes: ["XS", "S", "M", "L", "XL"],
    variants: [{ id: "black", label: "Studio Black", colorCode: "#111111", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=90"] }, { id: "cognac", label: "Cognac", colorCode: "#8a5738", images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=90"] }],
    images: [image("https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=90", "Black leather studio biker jacket", 0), image("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=90", "Cognac outerwear styling", 1), image("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=90", "Fashion studio clothing collection", 2), image("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90", "Jacket styled with neutral wardrobe pieces", 3)],
  },
  {
    category: "women", name: "Ivory Sculpted Midi Dress", slug: "ivory-sculpted-midi-dress", brand: "Faisal Yamin Studio", sku: "FYS-MD-003", price: 14900, compareAt: 16900, badge: "Online Exclusive", rating: 4.7, reviewsCount: 29,
    shortDesc: "An elegant midi dress cut with a softly defined waist, fluid skirt and clean contemporary neckline.", sizes: ["XS", "S", "M", "L"],
    variants: [{ id: "ivory", label: "Soft Ivory", colorCode: "#eee7da", images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=90"] }, { id: "rose", label: "Dusty Rose", colorCode: "#b77c78", images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=90"] }],
    images: [image("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=90", "Woman wearing an ivory sculpted midi dress", 0), image("https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=90", "Editorial women’s midi dress", 1), image("https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=90", "Flowing dress photographed outdoors", 2), image("https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=90", "Women’s fashion wardrobe", 3)],
  },
  {
    category: "men", name: "Modern Tailored Navy Suit", slug: "modern-tailored-navy-suit", brand: "Faisal Yamin Tailoring", sku: "FYT-NS-004", price: 34900, compareAt: 39900, badge: "Editor’s Choice", rating: 4.9, reviewsCount: 47,
    shortDesc: "A modern two-piece suit with a relaxed shoulder, clean notch lapel and tapered trouser for effortless formal dressing.", sizes: ["36", "38", "40", "42", "44"],
    variants: [{ id: "navy", label: "Midnight Navy", colorCode: "#1f3045", images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=90"] }, { id: "charcoal", label: "Charcoal", colorCode: "#484b4d", images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=90"] }],
    images: [image("https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=90", "Man wearing a modern tailored navy suit", 0), image("https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=90", "Charcoal business tailoring", 1), image("https://images.unsplash.com/photo-1555069519-127aadedf1ee?auto=format&fit=crop&w=1400&q=90", "Refined menswear tailoring details", 2), image("https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1400&q=90", "Men’s formal suit styling", 3)],
  },
  {
    category: "men", name: "Relaxed Linen Overshirt", slug: "relaxed-linen-overshirt", brand: "Faisal Yamin Essentials", sku: "FYE-LO-005", price: 11900, compareAt: 13900, badge: "Trending", rating: 4.8, reviewsCount: 33,
    shortDesc: "A breathable linen-blend overshirt with a relaxed cut, utility pockets and an easy layer-ready silhouette.", sizes: ["S", "M", "L", "XL", "XXL"],
    variants: [{ id: "stone", label: "Warm Stone", colorCode: "#c8b59e", images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1400&q=90"] }, { id: "olive", label: "Washed Olive", colorCode: "#6e725b", images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1400&q=90"] }],
    images: [image("https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1400&q=90", "Man wearing a warm stone linen overshirt", 0), image("https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1400&q=90", "Olive casual men’s overshirt", 1), image("https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=90", "Relaxed contemporary menswear", 2), image("https://images.unsplash.com/photo-1555069519-127aadedf1ee?auto=format&fit=crop&w=1400&q=90", "Premium menswear fabric detail", 3)],
  },
  {
    category: "essentials", name: "Fine Knit Merino Co-ord", slug: "fine-knit-merino-coord", brand: "Faisal Yamin Essentials", sku: "FYE-MK-006", price: 17900, compareAt: 19900, badge: "Limited Edition", rating: 4.8, reviewsCount: 21,
    shortDesc: "A refined merino-touch knit set combining a relaxed long-sleeve top with fluid straight-leg trousers.", sizes: ["XS", "S", "M", "L", "XL"],
    variants: [{ id: "oat", label: "Oatmeal", colorCode: "#d8cdbd", images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90"] }, { id: "cocoa", label: "Cocoa", colorCode: "#735444", images: ["https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=90"] }, { id: "ink", label: "Ink", colorCode: "#30343b", images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=90"] }],
    images: [image("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90", "Oatmeal fine knit merino co-ord", 0), image("https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=90", "Neutral knitwear wardrobe", 1), image("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=90", "Modern clothing collection in a studio", 2), image("https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=90", "Fine knit garment detail", 3)],
  },
];

const categoryData = [
  { name: "Women", slug: "women", description: "Modern womenswear, refined layers and occasion-ready silhouettes.", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=90", imageAlt: "Curated women’s fashion collection" },
  { name: "Men", slug: "men", description: "Contemporary menswear, relaxed tailoring and elevated everyday essentials.", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=90", imageAlt: "Modern men’s tailoring collection" },
  { name: "Essentials", slug: "essentials", description: "Versatile wardrobe foundations designed for repeat wear.", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90", imageAlt: "Premium wardrobe essentials" },
];

async function main() {
  const categories = {};
  for (const data of categoryData) {
    categories[data.slug] = await prisma.category.upsert({
      where: { slug: data.slug },
      update: { ...data, isFeatured: true, metaTitle: `${data.name} Fashion | Faisal Yamin`, metaDescription: data.description, metaKeywords: `${data.slug} fashion Pakistan, premium garments, Faisal Yamin` },
      create: { ...data, isFeatured: true, metaTitle: `${data.name} Fashion | Faisal Yamin`, metaDescription: data.description, metaKeywords: `${data.slug} fashion Pakistan, premium garments, Faisal Yamin` },
    });
  }

  for (const [index, item] of products.entries()) {
    const category = categories[item.category];
    const descriptionHtml = `<h2>Designed for the modern wardrobe</h2><p>${item.shortDesc}</p><h3>Fabric and construction</h3><p>Made from a carefully selected premium fabric blend with a soft hand-feel, considered structure and durable finishing. Seams and closures are reinforced for dependable everyday wear.</p><h3>Fit and styling</h3><p>Designed with a contemporary, easy-to-style proportion. Wear it with tonal separates for a refined look or contrast it with relaxed essentials.</p><h3>Care</h3><p>Dry clean recommended. Store in a cool, dry place and follow the care label supplied with the garment.</p>`;
    const data = {
      categoryId: category.id, name: item.name, slug: item.slug, brand: item.brand, sku: item.sku,
      price: item.price, compareAt: item.compareAt, badge: item.badge, rating: item.rating, reviewsCount: item.reviewsCount,
      shortDesc: item.shortDesc, descriptionHtml, sizes: item.sizes, variants: item.variants,
      isActive: true, isFeatured: true, isSale: true, isPrintable: false, indexable: true,
      metaTitle: `${item.name} | Faisal Yamin`, metaDescription: `${item.shortDesc} Shop online in Pakistan with secure checkout and reliable delivery.`,
      metaKeywords: `${item.name.toLowerCase()}, premium garments Pakistan, designer fashion, ${item.category} clothing`,
      productCategories: { deleteMany: {}, create: [{ categoryId: category.id }] },
      images: { deleteMany: {}, create: item.images },
      faqItems: { deleteMany: {}, create: [
        { question: "What fabric is this garment made from?", answer: "This piece uses a premium, comfort-focused fabric blend selected for its drape, durability and refined finish.", sortOrder: 0 },
        { question: "How should I choose my size?", answer: "Choose your usual size for the intended fit. If you are between sizes, select the larger size for a more relaxed silhouette.", sortOrder: 1 },
        { question: "How long does delivery take in Pakistan?", answer: "Orders are normally delivered within 2–5 working days, depending on your city and courier service.", sortOrder: 2 },
      ] },
    };
    const existing = await prisma.product.findUnique({ where: { slug: item.slug }, select: { id: true } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      await prisma.product.create({
        data: {
          ...data,
          createdAt: new Date(Date.now() - index * 60000),
          productCategories: { create: [{ categoryId: category.id }] },
          images: { create: item.images },
          faqItems: { create: data.faqItems.create },
        },
      });
    }
  }
  console.log(`Seeded ${products.length} fashion products and ${categoryData.length} categories.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
