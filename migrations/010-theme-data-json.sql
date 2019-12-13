-- Up
ALTER TABLE `theme` MODIFY COLUMN `data` json NULL;
ALTER TABLE `theme` MODIFY COLUMN `assets` json NULL;

-- Down
ALTER TABLE `theme` MODIFY COLUMN `data` longtext NULL;
ALTER TABLE `theme` MODIFY COLUMN `assets` longtext NULL;
