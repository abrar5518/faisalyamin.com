-- CreateTable
CREATE TABLE `AboutPage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NOT NULL,
    `breadcrumbLabel` VARCHAR(191) NULL,
    `heroNoteHtml` TEXT NULL,
    `storyTitle` VARCHAR(191) NULL,
    `storyIntro` TEXT NULL,
    `storyPrimaryLabel` VARCHAR(191) NULL,
    `storyPrimaryHref` VARCHAR(191) NULL,
    `storySecondaryLabel` VARCHAR(191) NULL,
    `storySecondaryHref` VARCHAR(191) NULL,
    `storyBodyHtml` LONGTEXT NULL,
    `valuesTitle` VARCHAR(191) NULL,
    `valuesIntro` TEXT NULL,
    `valuesAssistTitle` VARCHAR(191) NULL,
    `valuesAssistDesc` TEXT NULL,
    `valuesAssistCtaLabel` VARCHAR(191) NULL,
    `valuesAssistCtaHref` VARCHAR(191) NULL,
    `verificationTitle` VARCHAR(191) NULL,
    `verificationIntro` TEXT NULL,
    `verificationSupportLabel` VARCHAR(191) NULL,
    `verificationSupportHref` VARCHAR(191) NULL,
    `verificationMoreHtml` TEXT NULL,
    `supportTitle` VARCHAR(191) NULL,
    `supportIntro` TEXT NULL,
    `supportLinkLabel` VARCHAR(191) NULL,
    `supportLinkHref` VARCHAR(191) NULL,
    `faqTitle` VARCHAR(191) NULL,
    `faqIntro` TEXT NULL,
    `faqLinkLabel` VARCHAR(191) NULL,
    `faqLinkHref` VARCHAR(191) NULL,
    `faqFooterHtml` TEXT NULL,
    `finalCtaTitle` VARCHAR(191) NULL,
    `finalCtaDesc` TEXT NULL,
    `finalCtaPrimaryLabel` VARCHAR(191) NULL,
    `finalCtaPrimaryHref` VARCHAR(191) NULL,
    `finalCtaSecondaryLabel` VARCHAR(191) NULL,
    `finalCtaSecondaryHref` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AboutPage_pageId_key`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutStat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutStat_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutHeroChip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutHeroChip_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutHeroInfoCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `bodyHtml` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutHeroInfoCard_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutValueItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `desc` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutValueItem_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutVerificationStep` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `stepLabel` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `desc` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutVerificationStep_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutSupportLink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `href` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `desc` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutSupportLink_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutSupportCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `bodyHtml` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutSupportCard_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutFaqItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutFaqItem_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutFooterLink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aboutPageId` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `href` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutFooterLink_aboutPageId_idx`(`aboutPageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AboutPage` ADD CONSTRAINT `AboutPage_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutStat` ADD CONSTRAINT `AboutStat_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutHeroChip` ADD CONSTRAINT `AboutHeroChip_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutHeroInfoCard` ADD CONSTRAINT `AboutHeroInfoCard_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutValueItem` ADD CONSTRAINT `AboutValueItem_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutVerificationStep` ADD CONSTRAINT `AboutVerificationStep_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutSupportLink` ADD CONSTRAINT `AboutSupportLink_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutSupportCard` ADD CONSTRAINT `AboutSupportCard_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutFaqItem` ADD CONSTRAINT `AboutFaqItem_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AboutFooterLink` ADD CONSTRAINT `AboutFooterLink_aboutPageId_fkey` FOREIGN KEY (`aboutPageId`) REFERENCES `AboutPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
