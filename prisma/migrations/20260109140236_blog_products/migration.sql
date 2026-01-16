-- CreateTable
CREATE TABLE `BlogProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blogId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `placement` ENUM('TOP', 'MIDDLE', 'BOTTOM') NOT NULL DEFAULT 'MIDDLE',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BlogProduct_blogId_idx`(`blogId`),
    INDEX `BlogProduct_productId_idx`(`productId`),
    UNIQUE INDEX `BlogProduct_blogId_productId_key`(`blogId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlogProduct` ADD CONSTRAINT `BlogProduct_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `Blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogProduct` ADD CONSTRAINT `BlogProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
