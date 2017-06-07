
-- adding column for theme less and assets
-- ---------------------------------------------------------------------

ALTER TABLE `theme` ADD COLUMN `less` LONGTEXT;

ALTER TABLE `theme` ADD COLUMN `assets` LONGTEXT;
