
# This is a fix for InnoDB in MySQL >= 4.1.x
# It "suspends judgement" for fkey relationships until are tables are set.
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- chart
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `chart`;

CREATE TABLE `chart`
(
    `id` VARCHAR(5) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `theme` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `last_modified_at` DATETIME NOT NULL,
    `type` VARCHAR(200) NOT NULL,
    `metadata` LONGTEXT NOT NULL,
    `deleted` TINYINT(1) DEFAULT 0,
    `deleted_at` DATETIME,
    `author_id` INTEGER,
    `show_in_gallery` TINYINT(1) DEFAULT 0,
    `language` VARCHAR(5) DEFAULT '',
    `guest_session` VARCHAR(255),
    `last_edit_step` INTEGER DEFAULT 0,
    `published_at` DATETIME,
    `public_url` VARCHAR(255),
    `public_version` INTEGER DEFAULT 0,
    `organization_id` VARCHAR(128),
    `forked_from` VARCHAR(5),
    PRIMARY KEY (`id`),
    INDEX `chart_FI_1` (`author_id`),
    INDEX `chart_FI_2` (`organization_id`),
    INDEX `chart_FI_3` (`forked_from`),
    CONSTRAINT `chart_FK_1`
        FOREIGN KEY (`author_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `chart_FK_2`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`),
    CONSTRAINT `chart_FK_3`
        FOREIGN KEY (`forked_from`)
        REFERENCES `chart` (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- user
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(512) NOT NULL,
    `pwd` VARCHAR(512) NOT NULL,
    `activate_token` VARCHAR(512),
    `reset_password_token` VARCHAR(512),
    `role` TINYINT DEFAULT 2 NOT NULL,
    `deleted` TINYINT(1) DEFAULT 0,
    `language` VARCHAR(5) DEFAULT 'en',
    `created_at` DATETIME NOT NULL,
    `name` VARCHAR(512),
    `website` VARCHAR(512),
    `sm_profile` VARCHAR(512),
    `oauth_signin` VARCHAR(512),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

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
    `default_theme` VARCHAR(128) DEFAULT '',
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
-- action
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `action`;

CREATE TABLE `action`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `action_time` DATETIME NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `details` VARCHAR(512),
    PRIMARY KEY (`id`),
    INDEX `action_FI_1` (`user_id`),
    CONSTRAINT `action_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- stats
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `stats`;

CREATE TABLE `stats`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME NOT NULL,
    `metric` VARCHAR(255) NOT NULL,
    `value` INTEGER NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- session
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `session`;

CREATE TABLE `session`
(
    `session_id` VARCHAR(32) NOT NULL,
    `date_created` DATETIME NOT NULL,
    `last_updated` DATETIME NOT NULL,
    `session_data` LONGTEXT NOT NULL,
    PRIMARY KEY (`session_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- job
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `job`;

CREATE TABLE `job`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `chart_id` VARCHAR(5) NOT NULL,
    `status` TINYINT DEFAULT 0 NOT NULL,
    `created_at` DATETIME NOT NULL,
    `done_at` DATETIME NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `parameter` VARCHAR(4096) NOT NULL,
    `fail_reason` VARCHAR(4096) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `job_FI_1` (`user_id`),
    INDEX `job_FI_2` (`chart_id`),
    CONSTRAINT `job_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `job_FK_2`
        FOREIGN KEY (`chart_id`)
        REFERENCES `chart` (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- plugin
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `plugin`;

CREATE TABLE `plugin`
(
    `id` VARCHAR(128) NOT NULL,
    `installed_at` DATETIME NOT NULL,
    `enabled` TINYINT(1) DEFAULT 0,
    `is_private` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

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

-- ---------------------------------------------------------------------
-- plugin_data
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `plugin_data`;

CREATE TABLE `plugin_data`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plugin_id` VARCHAR(128) NOT NULL,
    `stored_at` DATETIME NOT NULL,
    `key` VARCHAR(128) NOT NULL,
    `data` VARCHAR(4096),
    PRIMARY KEY (`id`),
    INDEX `plugin_data_FI_1` (`plugin_id`),
    CONSTRAINT `plugin_data_FK_1`
        FOREIGN KEY (`plugin_id`)
        REFERENCES `plugin` (`id`)
) ENGINE=InnoDB;

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

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
