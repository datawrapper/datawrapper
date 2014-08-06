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
-- organization_product
-- ---------------------------------------------------------------------

