-- Up
ALTER TABLE `theme` MODIFY COLUMN `data` json NULL;

-- Down
ALTER TABLE `theme` MODIFY COLUMN `data` longtext NULL;
