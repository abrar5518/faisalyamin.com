CREATE TABLE `HomeHeroSlide` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NOT NULL,
    `eyebrow` VARCHAR(191) NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NULL,
    `primaryLabel` VARCHAR(191) NULL,
    `primaryHref` VARCHAR(191) NULL,
    `secondaryLabel` VARCHAR(191) NULL,
    `secondaryHref` VARCHAR(191) NULL,
    `desktopImage` LONGTEXT NOT NULL,
    `mobileImage` LONGTEXT NULL,
    `imageAlt` TEXT NULL,
    `backgroundColor` VARCHAR(191) NULL DEFAULT '#f5efe6',
    `accentColor` VARCHAR(191) NULL DEFAULT '#b36f49',
    `badgeText` VARCHAR(191) NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HomeHeroSlide_pageId_sortOrder_idx`(`pageId`, `sortOrder`),
    INDEX `HomeHeroSlide_pageId_isEnabled_idx`(`pageId`, `isEnabled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `HomeHeroSlide`
ADD CONSTRAINT `HomeHeroSlide_pageId_fkey`
FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
