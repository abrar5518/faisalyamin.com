ALTER TABLE `SiteSettings` ADD COLUMN `catalogSettings` LONGTEXT NULL;

INSERT IGNORE INTO `Page` (`title`, `slug`, `shortDescription`, `metaTitle`, `metaDescription`, `createdAt`, `updatedAt`)
VALUES
  ('Categories', 'categories', 'Browse product categories and collections.', 'Categories', 'Browse product categories and collections.', NOW(), NOW());
