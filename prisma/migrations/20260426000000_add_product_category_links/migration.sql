-- CreateTable
CREATE TABLE `ProductCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductCategory_categoryId_idx`(`categoryId`),
    INDEX `ProductCategory_productId_idx`(`productId`),
    UNIQUE INDEX `ProductCategory_productId_categoryId_key`(`productId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSubcategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `subcategoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductSubcategory_subcategoryId_idx`(`subcategoryId`),
    INDEX `ProductSubcategory_productId_idx`(`productId`),
    UNIQUE INDEX `ProductSubcategory_productId_subcategoryId_key`(`productId`, `subcategoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Backfill existing primary assignments so multi-category filters work immediately.
INSERT IGNORE INTO `ProductCategory` (`productId`, `categoryId`, `createdAt`)
SELECT `id`, `categoryId`, CURRENT_TIMESTAMP(3)
FROM `Product`;

INSERT IGNORE INTO `ProductSubcategory` (`productId`, `subcategoryId`, `createdAt`)
SELECT `id`, `subcategoryId`, CURRENT_TIMESTAMP(3)
FROM `Product`
WHERE `subcategoryId` IS NOT NULL;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubcategory` ADD CONSTRAINT `ProductSubcategory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubcategory` ADD CONSTRAINT `ProductSubcategory_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `Subcategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
