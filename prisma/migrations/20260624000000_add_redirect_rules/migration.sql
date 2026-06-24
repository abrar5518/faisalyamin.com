CREATE TABLE `RedirectRule` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `source` VARCHAR(512) NOT NULL,
  `destination` VARCHAR(512) NOT NULL,
  `permanent` BOOLEAN NOT NULL DEFAULT true,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `note` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `RedirectRule_source_key`(`source`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `RedirectRule` (`source`, `destination`, `permanent`, `isActive`, `note`, `updatedAt`) VALUES
('/product/commando-water-bottle-500ml-leakproof-bpa-free-sports-travel-bottle-random-color-design', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/double-wall-insulated-stainless-steel-water-bottle-800ml-hot-cold-leak-proof-portable-design-black', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/stylish-printed-water-bottle-650ml-leak-proof-stainless-steel-trendy-design-with-box-premium-quality-random-color', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/transparent-plastic-water-bottle-500ml-durable-lightweight-and-easy-to-carry-random-colour', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/durable-1000ml-vacuum-insulated-stainless-steel-bottle-keeps-drinks-hot-or-cold-with-carrying-strap', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/premium-marble-print-stainless-steel-water-bottle-elegant-vacuum-insulated-flask-random-color-1000ml', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/premium-1000ml-stainless-steel-water-bottle-leakproof-insulated-water-flask-random-color', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/smart-crystal-glass-colored-travel-water-bottle-500ml-fancy-stylish-leakproof-water-bottle', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/cute-korean-style-glass-water-bottle-with-stainless-steel-lid-carry-strap-400ml', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3)),
('/product/customize-with-your-name-smart-led-temperature-water-bottle-500ml-stainless-steel-hot-cold-bottles-with-vacuum-thermos-flask', '/', true, true, 'Imported from redirects.json', CURRENT_TIMESTAMP(3));
