ALTER TABLE `SiteSettings`
  ADD COLUMN `metaPixelEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `googleTagManagerEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `microsoftClarityEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `customHeadScriptsEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `customBodyStartScriptsEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `customBodyEndScriptsEnabled` BOOLEAN NOT NULL DEFAULT true;
