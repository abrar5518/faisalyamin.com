ALTER TABLE `SiteSettings`
  ADD COLUMN `metaPixelIds` TEXT NULL,
  ADD COLUMN `facebookDomainVerification` TEXT NULL,
  ADD COLUMN `googleSiteVerification` TEXT NULL,
  ADD COLUMN `googleTagManagerId` TEXT NULL,
  ADD COLUMN `microsoftClarityId` TEXT NULL,
  ADD COLUMN `customHeadScripts` LONGTEXT NULL,
  ADD COLUMN `customBodyStartScripts` LONGTEXT NULL,
  ADD COLUMN `customBodyEndScripts` LONGTEXT NULL;

UPDATE `SiteSettings`
SET
  `metaPixelIds` = COALESCE(`metaPixelIds`, '863606865641935'),
  `facebookDomainVerification` = COALESCE(`facebookDomainVerification`, 'yf46xy2cxecanwy1wjjeigq6v3uj9l'),
  `microsoftClarityId` = COALESCE(`microsoftClarityId`, 'wowgqlkt86');
