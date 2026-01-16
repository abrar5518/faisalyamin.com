-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `loyaltyPoints` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `loyaltyDiscount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `loyaltyPointsRedeemed` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `loyaltyPointsEarned` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `LoyaltySettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `pointsPerCurrency` DECIMAL(12, 4) NOT NULL DEFAULT 0.0100,
    `currencyPerPoint` DECIMAL(12, 4) NOT NULL DEFAULT 0.0500,
    `minRedeemPoints` INTEGER NOT NULL DEFAULT 100,
    `maxRedeemPercent` INTEGER NOT NULL DEFAULT 50,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
