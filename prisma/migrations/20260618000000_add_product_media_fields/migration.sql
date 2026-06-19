ALTER TABLE `ProductImage`
  ADD COLUMN `mediaType` VARCHAR(191) NOT NULL DEFAULT 'image',
  ADD COLUMN `thumbnailUrl` TEXT NULL;
