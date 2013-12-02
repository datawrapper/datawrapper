
ALTER TABLE plugin ADD COLUMN `is_private` TINYINT(1) DEFAULT 0;

-- ---------------------------------------------------------------------
-- organization
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `organization`;

CREATE TABLE `organization`
(
    `id` VARCHAR(128) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `deleted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- user_organization
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `user_organization`;

CREATE TABLE `user_organization`
(
    `user_id` INTEGER NOT NULL,
    `organization_id` VARCHAR(128) NOT NULL,
    `organization_role` TINYINT DEFAULT 1 NOT NULL,
    PRIMARY KEY (`user_id`,`organization_id`),
    INDEX `user_organization_FI_2` (`organization_id`)
) ENGINE=MyISAM;

-- ---------------------------------------------------------------------
-- plugin_organization
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `plugin_organization`;

CREATE TABLE `plugin_organization`
(
    `plugin_id` VARCHAR(128) NOT NULL,
    `organization_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`plugin_id`,`organization_id`),
    INDEX `plugin_organization_FI_2` (`organization_id`)
) ENGINE=MyISAM;

