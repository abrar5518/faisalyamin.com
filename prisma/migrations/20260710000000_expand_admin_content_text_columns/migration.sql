ALTER TABLE `Category`
  MODIFY `name` TEXT NOT NULL,
  MODIFY `description` TEXT NULL;

ALTER TABLE `Subcategory`
  MODIFY `name` TEXT NOT NULL,
  MODIFY `description` TEXT NULL;

ALTER TABLE `Product`
  MODIFY `name` TEXT NOT NULL,
  MODIFY `shortDesc` TEXT NULL;

ALTER TABLE `Blog`
  MODIFY `title` TEXT NOT NULL,
  MODIFY `excerpt` TEXT NULL;
