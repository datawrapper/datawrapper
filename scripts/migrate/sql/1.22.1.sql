ALTER TABLE user_product ADD COLUMN `created_by_admin` TINYINT(1) DEFAULT 1;
ALTER TABLE user_product ADD COLUMN `changes` LONGTEXT;
ALTER TABLE organization_product ADD COLUMN `created_by_admin` TINYINT(1) DEFAULT 1;
ALTER TABLE organization_product ADD COLUMN `changes` LONGTEXT;
ALTER TABLE product ADD COLUMN `priority` INTEGER DEFAULT 0;