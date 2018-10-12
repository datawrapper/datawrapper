ALTER TABLE user_product ADD COLUMN `created_by_admin` TINYINT(1) DEFAULT 1;
ALTER TABLE user_product ADD COLUMN `changes` LONGTEXT;
ALTER TABLE organization_product ADD COLUMN `created_by_admin` TINYINT(1) DEFAULT 1;
ALTER TABLE organization_product ADD COLUMN `changes` LONGTEXT;
ALTER TABLE product ADD COLUMN `priority` INTEGER DEFAULT 0;
ALTER TABLE chart_public ADD COLUMN `first_published_at` DATETIME;
ALTER TABLE chart_public ADD COLUMN `author_id` INTEGER;
ALTER TABLE chart_public ADD COLUMN `organization_id` VARCHAR(128);