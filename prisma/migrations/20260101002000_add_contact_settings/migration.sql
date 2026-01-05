CREATE TABLE `Contact` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(191) NULL,
  `whatsapp` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `addressLine1` VARCHAR(191) NULL,
  `addressLine2` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `state` VARCHAR(191) NULL,
  `country` VARCHAR(191) NULL,
  `postalCode` VARCHAR(191) NULL,
  `hoursWeekdays` VARCHAR(191) NULL,
  `hoursWeekend` VARCHAR(191) NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
