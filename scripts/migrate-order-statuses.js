// Script to migrate PAID status to CONFIRMED before schema migration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting order status migration...');
  
  // Update all PAID orders to CONFIRMED
  const result = await prisma.order.updateMany({
    where: {
      status: 'PAID',
    },
    data: {
      status: 'CONFIRMED',
    },
  });
  
  console.log(`✅ Updated ${result.count} orders from PAID to CONFIRMED`);
  
  // Show current status distribution
  const orders = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  });
  
  console.log('\nCurrent order status distribution:');
  orders.forEach(({ status, _count }) => {
    console.log(`  ${status}: ${_count}`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
