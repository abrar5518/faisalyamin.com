-- CreateTable
CREATE TABLE `HomeTestimonial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `quote` TEXT NULL,
    `avatarUrl` TEXT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 5,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `HomeTestimonial_pageId_idx`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HomeTestimonial` ADD CONSTRAINT `HomeTestimonial_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
