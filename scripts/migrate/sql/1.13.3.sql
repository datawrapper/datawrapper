
-- adding column for theme less and assets
-- ---------------------------------------------------------------------

ALTER TABLE `theme` ADD COLUMN `less` LONGTEXT;

ALTER TABLE `theme` ADD COLUMN `assets` LONGTEXT;

INSERT INTO `theme` (`id`, `created_at`, `extend`, `title`, `data`, `less`, `assets`)
VALUES ('default', '2017-05-04 12:00:00', NULL, 'Default', '{\"colors\":{\"palette\":[\"#1f77b4\",\"#ff7f0e\",\"#2ca02c\",\"#d62728\",\"#9467bd\"],\"secondary\":[\"#000000\",\"#777777\",\"#cccccc\",\"#ffd500\",\"#6FAA12\"],\"context\":\"#aaa\",\"axis\":\"#000000\",\"positive\":\"#1f77b4\",\"negative\":\"#d62728\",\"background\":\"#fff\"},\"lineChart\":{\"fillOpacity\":0.2},\"vpadding\":10,\"columnChart\":{\"darkenStroke\":5},\"chart\":{\"padding\":\"0px\"},\"typography\":{\"typeface\":\"Helvetica, sans-serif\",\"fontAppearance\":{\"fontSize\":\"12px\"},\"headline\":{\"fontAppearance\":{\"fontSize\":\"22px\",\"fontWeight\":\"300\"}},\"description\":{\"fontAppearance\":{\"fontSize\":\"16px\",\"fontWeight\":\"300\"}},\"footer\":{\"fontAppearance\":{\"fontSize\":\"11px\"},\"color\":\"#888\",\"links\":{\"color\":\"#0088CC\"}},\"chart\":{\"typeface\":\"Helvetica, sans-serif\"},\"notes\":{}},\"links\":{\"getTheData\":0,\"createdWithDatawrapper\":1}}', ' ', NULL);