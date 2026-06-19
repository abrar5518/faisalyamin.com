ALTER TABLE `SiteSettings`
  ADD COLUMN `footerCopyright` TEXT NULL,
  ADD COLUMN `footerColumns` TEXT NULL,
  ADD COLUMN `footerNewsletterEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `footerNewsletterEyebrow` TEXT NULL,
  ADD COLUMN `footerNewsletterTitle` TEXT NULL,
  ADD COLUMN `footerNewsletterSubtitle` TEXT NULL,
  ADD COLUMN `footerNewsletterConsentText` TEXT NULL,
  ADD COLUMN `footerTrustItems` TEXT NULL,
  ADD COLUMN `footerSocialLinks` TEXT NULL;
