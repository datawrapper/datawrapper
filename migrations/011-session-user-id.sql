-- Up
ALTER TABLE `session` ADD COLUMN `user_id` INTEGER NULL;
ALTER TABLE `session` ADD COLUMN `persistent` TINYINT(1) DEFAULT 0;

-- Down
ALTER TABLE `session` DROP COLUMN `user_id`;
ALTER TABLE `session` DROP COLUMN `persistent`;