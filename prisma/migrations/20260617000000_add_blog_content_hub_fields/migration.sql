ALTER TABLE `Blog`
  ADD COLUMN `category` VARCHAR(191) NULL,
  ADD COLUMN `tags` TEXT NULL,
  ADD COLUMN `authorId` INTEGER NULL;

CREATE INDEX `Blog_authorId_idx` ON `Blog`(`authorId`);

ALTER TABLE `Blog`
  ADD CONSTRAINT `Blog_authorId_fkey`
  FOREIGN KEY (`authorId`) REFERENCES `BlogAuthor`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

INSERT IGNORE INTO `Page` (`title`, `slug`, `shortDescription`, `metaTitle`, `metaDescription`, `createdAt`, `updatedAt`)
VALUES
  ('Blog', 'blog', 'Read buying guides, product tips, and customer education articles.', 'Blog', 'Read buying guides, product tips, and customer education articles.', NOW(), NOW());
