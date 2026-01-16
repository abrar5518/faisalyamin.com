-- AlterTable
ALTER TABLE `page` ADD COLUMN `homeBenefitsCard1Desc` TEXT NULL,
    ADD COLUMN `homeBenefitsCard1Title` VARCHAR(191) NULL,
    ADD COLUMN `homeBenefitsCard2Desc` TEXT NULL,
    ADD COLUMN `homeBenefitsCard2Title` VARCHAR(191) NULL,
    ADD COLUMN `homeBenefitsCard3Desc` TEXT NULL,
    ADD COLUMN `homeBenefitsCard3Title` VARCHAR(191) NULL,
    ADD COLUMN `homeBenefitsIntro` TEXT NULL,
    ADD COLUMN `homeBenefitsTitle` VARCHAR(191) NULL,
    ADD COLUMN `homeFaqIntro` TEXT NULL,
    ADD COLUMN `homeFaqTitle` VARCHAR(191) NULL,
    ADD COLUMN `homeIntroBody` TEXT NULL,
    ADD COLUMN `homeIntroTitle` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `HomeFaqItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `HomeFaqItem_pageId_idx`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HomeFaqItem` ADD CONSTRAINT `HomeFaqItem_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
