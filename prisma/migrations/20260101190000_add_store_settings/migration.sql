CREATE TABLE `StoreSettings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `storeName` VARCHAR(191) NULL,
  `storeDomain` VARCHAR(191) NULL,
  `freeShippingThreshold` VARCHAR(191) NULL,
  `defaultShippingFee` VARCHAR(191) NULL,
  `returnsDays` INT NULL,
  `codEnabled` BOOLEAN NOT NULL DEFAULT true,
  `cardEnabled` BOOLEAN NOT NULL DEFAULT true,
  `gatewayName` VARCHAR(191) NULL,
  `cryptoEnabled` BOOLEAN NOT NULL DEFAULT false,
  `siteTitle` TEXT NULL,
  `siteMetaDesc` TEXT NULL,
  `indexable` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
