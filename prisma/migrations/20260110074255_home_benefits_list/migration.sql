/*
  Warnings:

  - You are about to drop the column `homeBenefitsCard1Desc` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `homeBenefitsCard1Title` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `homeBenefitsCard2Desc` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `homeBenefitsCard2Title` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `homeBenefitsCard3Desc` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `homeBenefitsCard3Title` on the `page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `page` DROP COLUMN `homeBenefitsCard1Desc`,
    DROP COLUMN `homeBenefitsCard1Title`,
    DROP COLUMN `homeBenefitsCard2Desc`,
    DROP COLUMN `homeBenefitsCard2Title`,
    DROP COLUMN `homeBenefitsCard3Desc`,
    DROP COLUMN `homeBenefitsCard3Title`;

-- CreateTable
CREATE TABLE `HomeBenefitItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `desc` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `HomeBenefitItem_pageId_idx`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HomeBenefitItem` ADD CONSTRAINT `HomeBenefitItem_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
