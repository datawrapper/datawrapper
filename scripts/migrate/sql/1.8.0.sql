-- ---------------------------------------------------------------------
-- product
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `product`;

CREATE TABLE `product`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(512) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `deleted` TINYINT(1) DEFAULT 0,
    `data` LONGTEXT,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- product_plugin
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `product_plugin`;

CREATE TABLE `product_plugin`
(
    `product_id` VARCHAR(128) NOT NULL,
    `plugin_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`product_id`,`plugin_id`),
    INDEX `product_plugin_FI_2` (`plugin_id`)
) ENGINE=MyISAM;

-- ---------------------------------------------------------------------
-- user_product
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `user_product`;

CREATE TABLE `user_product`
(
    `user_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `expires` DATETIME,
    PRIMARY KEY (`user_id`,`product_id`),
    INDEX `user_product_FI_2` (`product_id`)
) ENGINE=MyISAM;

-- ---------------------------------------------------------------------
-- organization_product
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `organization_product`;

CREATE TABLE `organization_product`
(
    `organization_id` VARCHAR(128) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `expires` DATETIME,
    PRIMARY KEY (`organization_id`,`product_id`),
    INDEX `organization_product_FI_2` (`product_id`)
) ENGINE=MyISAM;

-- ---------------------------------------------------------------------
-- MIGRATE data
-- ---------------------------------------------------------------------

-- Create one product per organization
INSERT `product` (name, created_at, data)
    SELECT id, created_at, '{}' FROM organization;

-- Assign each new product to the organization with the same name
INSERT `organization_product` (organization_id, product_id, expires)
    SELECT name, id, DATE_ADD(NOW(), INTERVAL 5 year) FROM product;

-- Assign the organizations plugins to the new product
INSERT `product_plugin` (product_id, plugin_id)
    SELECT product.id, plugin_id FROM plugin_organization LEFT JOIN product
    ON (product.name = organization_id);

-- add default theme for organizations
ALTER TABLE `organization` ADD COLUMN `default_theme` VARCHAR(128) DEFAULT '';
