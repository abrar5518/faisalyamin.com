CREATE TABLE `ReusableBlock` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'trust',
  `placement` VARCHAR(191) NOT NULL DEFAULT 'general',
  `eyebrow` VARCHAR(191) NULL,
  `bodyHtml` LONGTEXT NULL,
  `icon` VARCHAR(191) NULL,
  `primaryLabel` VARCHAR(191) NULL,
  `primaryHref` VARCHAR(191) NULL,
  `secondaryLabel` VARCHAR(191) NULL,
  `secondaryHref` VARCHAR(191) NULL,
  `itemsJson` LONGTEXT NULL,
  `isEnabled` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `ReusableBlock_slug_key`(`slug`),
  INDEX `ReusableBlock_placement_idx`(`placement`),
  INDEX `ReusableBlock_isEnabled_idx`(`isEnabled`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `ReusableBlock`
  (`title`, `slug`, `type`, `placement`, `eyebrow`, `bodyHtml`, `itemsJson`, `isEnabled`, `sortOrder`, `createdAt`, `updatedAt`)
VALUES
  (
    'Checkout Reassurance',
    'checkout-reassurance',
    'trust',
    'checkout',
    'Shop with confidence',
    '<p>Clear support, cash on delivery, and reliable delivery information help customers complete their order with confidence.</p>',
    '[{"title":"Cash on Delivery","text":"Pay when your parcel arrives."},{"title":"Delivery Across Pakistan","text":"Courier delivery available across supported cities."},{"title":"WhatsApp Support","text":"Customers can ask for help before placing an order."}]',
    true,
    10,
    NOW(3),
    NOW(3)
  ),
  (
    'Cart Trust Strip',
    'cart-trust-strip',
    'trust',
    'cart',
    'Why shop here',
    '<p>Reusable reassurance content for the cart page.</p>',
    '[{"title":"Quality checked","text":"Products are checked before dispatch."},{"title":"Reliable delivery","text":"Delivery is available across Pakistan."},{"title":"Customer support","text":"Fast help before and after purchase."}]',
    true,
    20,
    NOW(3),
    NOW(3)
  );
