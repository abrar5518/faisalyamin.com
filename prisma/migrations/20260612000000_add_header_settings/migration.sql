ALTER TABLE `SiteSettings`
  ADD COLUMN `headerMenuItems` TEXT NULL,
  ADD COLUMN `headerSearchPlaceholder` TEXT NULL,
  ADD COLUMN `headerAnnouncementEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `headerAnnouncementText` TEXT NULL,
  ADD COLUMN `headerAnnouncementHref` TEXT NULL,
  ADD COLUMN `headerShowSearch` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `headerShowAccount` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `headerShowCart` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `headerShowSupportLinks` BOOLEAN NOT NULL DEFAULT true;
