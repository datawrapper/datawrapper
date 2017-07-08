ALTER TABLE `user` ADD COLUMN `customer_id` varchar(255);
ALTER TABLE `action` MODIFY `user_id` INTEGER;
ALTER TABLE `action` ADD COLUMN `identifier` VARCHAR(512);