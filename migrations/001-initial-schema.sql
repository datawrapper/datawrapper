-- Adds chart

-- Up
# This is a fix for InnoDB in MySQL >= 4.1.x
# It "suspends judgement" for fkey relationships until are tables are set.
SET FOREIGN_KEY_CHECKS = 0;


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
    `external_data` VARCHAR(255),
    `forkable` TINYINT(1) DEFAULT 0,
    `is_fork` TINYINT(1) DEFAULT 0,
    `in_folder` INTEGER,
    PRIMARY KEY (`id`),
    INDEX `chart_FI_1` (`author_id`),
    INDEX `chart_FI_2` (`organization_id`),
    INDEX `chart_FI_3` (`forked_from`),
    INDEX `chart_FI_4` (`in_folder`),
    CONSTRAINT `chart_FK_1`
        FOREIGN KEY (`author_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `chart_FK_2`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`),
    CONSTRAINT `chart_FK_3`
        FOREIGN KEY (`forked_from`)
        REFERENCES `chart` (`id`),
    CONSTRAINT `chart_FK_4`
        FOREIGN KEY (`in_folder`)
        REFERENCES `folder` (`folder_id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `chart_public`
(
    `id` VARCHAR(5) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(200) NOT NULL,
    `metadata` LONGTEXT NOT NULL,
    `external_data` VARCHAR(255),
    `first_published_at` DATETIME,
    `author_id` INTEGER,
    `organization_id` VARCHAR(128),
    PRIMARY KEY (`id`),
    CONSTRAINT `chart_public_FK_1`
        FOREIGN KEY (`id`)
        REFERENCES `chart` (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `user`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(512) NOT NULL,
    `pwd` VARCHAR(512) NOT NULL,
    `activate_token` VARCHAR(512),
    `reset_password_token` VARCHAR(512),
    `role` TINYINT DEFAULT 2 NOT NULL,
    `deleted` TINYINT(1) DEFAULT 0,
    `language` VARCHAR(5) DEFAULT 'en-US',
    `created_at` DATETIME NOT NULL,
    `name` VARCHAR(512),
    `website` VARCHAR(512),
    `sm_profile` VARCHAR(512),
    `oauth_signin` VARCHAR(512),
    `customer_id` VARCHAR(512),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `organization`
(
    `id` VARCHAR(128) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `deleted` TINYINT(1) DEFAULT 0,
    `disabled` TINYINT(1) DEFAULT 0,
    `default_theme` VARCHAR(128) DEFAULT '',
    `settings` LONGTEXT,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `user_organization`
(
    `user_id` INTEGER NOT NULL,
    `organization_id` VARCHAR(128) NOT NULL,
    `organization_role` TINYINT DEFAULT 2 NOT NULL,
    `invite_token` VARCHAR(128) DEFAULT '' NOT NULL,
    PRIMARY KEY (`user_id`,`organization_id`),
    INDEX `user_organization_FI_2` (`organization_id`),
    CONSTRAINT `user_organization_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `user_organization_FK_2`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`)
) ENGINE=InnoDB CHARSET=utf8;



CREATE TABLE `action`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER,
    `action_time` DATETIME NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `identifier` VARCHAR(512),
    `details` VARCHAR(512),
    PRIMARY KEY (`id`),
    INDEX `action_FI_1` (`user_id`),
    CONSTRAINT `action_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `stats`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME NOT NULL,
    `metric` VARCHAR(255) NOT NULL,
    `value` INTEGER NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `session`
(
    `session_id` VARCHAR(32) NOT NULL,
    `date_created` DATETIME NOT NULL,
    `last_updated` DATETIME NOT NULL,
    `session_data` LONGTEXT NOT NULL,
    PRIMARY KEY (`session_id`)
) ENGINE=InnoDB CHARSET=utf8;


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
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `plugin`
(
    `id` VARCHAR(128) NOT NULL,
    `installed_at` DATETIME NOT NULL,
    `enabled` TINYINT(1) DEFAULT 0,
    `is_private` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `plugin_organization`
(
    `plugin_id` VARCHAR(128) NOT NULL,
    `organization_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`plugin_id`,`organization_id`),
    INDEX `plugin_organization_FI_2` (`organization_id`),
    CONSTRAINT `plugin_organization_FK_1`
        FOREIGN KEY (`plugin_id`)
        REFERENCES `plugin` (`id`),
    CONSTRAINT `plugin_organization_FK_2`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`)
) ENGINE=InnoDB CHARSET=utf8;


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
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `product`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(512) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `deleted` TINYINT(1) DEFAULT 0,
    `priority` INTEGER DEFAULT 0,
    `data` LONGTEXT,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8;

CREATE TABLE `product_plugin`
(
    `product_id` INTEGER NOT NULL,
    `plugin_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`product_id`,`plugin_id`),
    INDEX `product_plugin_FI_2` (`plugin_id`),
    CONSTRAINT `product_plugin_FK_1`
        FOREIGN KEY (`product_id`)
        REFERENCES `product` (`id`),
    CONSTRAINT `product_plugin_FK_2`
        FOREIGN KEY (`plugin_id`)
        REFERENCES `plugin` (`id`)
) ENGINE=InnoDB CHARSET=utf8;

CREATE TABLE `user_product`
(
    `user_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `created_by_admin` TINYINT(1) DEFAULT 1,
    `changes` LONGTEXT,
    `expires` DATETIME,
    PRIMARY KEY (`user_id`,`product_id`),
    INDEX `user_product_FI_2` (`product_id`),
    CONSTRAINT `user_product_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `user_product_FK_2`
        FOREIGN KEY (`product_id`)
        REFERENCES `product` (`id`)
) ENGINE=InnoDB CHARSET=utf8;

CREATE TABLE `organization_product`
(
    `organization_id` VARCHAR(128) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `created_by_admin` TINYINT(1) DEFAULT 1,
    `changes` LONGTEXT,
    `expires` DATETIME,
    PRIMARY KEY (`organization_id`,`product_id`),
    INDEX `organization_product_FI_2` (`product_id`),
    CONSTRAINT `organization_product_FK_1`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`),
    CONSTRAINT `organization_product_FK_2`
        FOREIGN KEY (`product_id`)
        REFERENCES `product` (`id`)
) ENGINE=InnoDB CHARSET=utf8;

CREATE TABLE `theme`
(
    `id` VARCHAR(128) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `extend` VARCHAR(128),
    `title` VARCHAR(128),
    `data` LONGTEXT,
    `less` LONGTEXT,
    `assets` LONGTEXT,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `organization_theme`
(
    `organization_id` VARCHAR(128) NOT NULL,
    `theme_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`organization_id`,`theme_id`),
    INDEX `organization_theme_FI_2` (`theme_id`),
    CONSTRAINT `organization_theme_FK_1`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`),
    CONSTRAINT `organization_theme_FK_2`
        FOREIGN KEY (`theme_id`)
        REFERENCES `theme` (`id`)
) ENGINE=InnoDB CHARSET=utf8;

CREATE TABLE `user_theme`
(
    `user_id` INTEGER NOT NULL,
    `theme_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`user_id`,`theme_id`),
    INDEX `user_theme_FI_2` (`theme_id`),
    CONSTRAINT `user_theme_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `user_theme_FK_2`
        FOREIGN KEY (`theme_id`)
        REFERENCES `theme` (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `folder`
(
    `folder_id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER,
    `folder_name` VARCHAR(128),
    `user_id` INTEGER,
    `org_id` VARCHAR(128),
    PRIMARY KEY (`folder_id`),
    INDEX `folder_FI_1` (`parent_id`),
    INDEX `folder_FI_2` (`user_id`),
    INDEX `folder_FI_3` (`org_id`),
    CONSTRAINT `folder_FK_1`
        FOREIGN KEY (`parent_id`)
        REFERENCES `folder` (`folder_id`),
    CONSTRAINT `folder_FK_2`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `folder_FK_3`
        FOREIGN KEY (`org_id`)
        REFERENCES `organization` (`id`)
) ENGINE=InnoDB CHARSET=utf8;

CREATE TABLE `user_data`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `stored_at` TIMESTAMP NOT NULL DEFAULT NOW(),
    `key` VARCHAR(128) NOT NULL,
    `value` VARCHAR(4096),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `user_data_U_1` (`user_id`, `key`),
    CONSTRAINT `user_data_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `user_plugin_cache`
(
    `user_id` INTEGER NOT NULL,
    `plugins` LONGTEXT NOT NULL,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `user_plugin_cache_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `auth_token`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `comment` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `last_used_at` DATETIME,
    PRIMARY KEY (`id`,`user_id`),
    INDEX `auth_token_FI_1` (`user_id`),
    CONSTRAINT `auth_token_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`)
) ENGINE=InnoDB CHARSET=utf8;


CREATE TABLE `login_token`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `redirect_url` VARCHAR(64) NOT NULL,
    PRIMARY KEY (`id`,`user_id`),
    INDEX `login_token_FI_1` (`user_id`),
    CONSTRAINT `login_token_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`)
) ENGINE=InnoDB CHARSET=utf8;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;

-- Down

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `user_organization`;
DROP TABLE IF EXISTS `action`;
DROP TABLE IF EXISTS `stats`;
DROP TABLE IF EXISTS `session`;
DROP TABLE IF EXISTS `job`;
DROP TABLE IF EXISTS `plugin`;
DROP TABLE IF EXISTS `plugin_organization`;
DROP TABLE IF EXISTS `plugin_data`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `product_plugin`;
DROP TABLE IF EXISTS `user_product`;
DROP TABLE IF EXISTS `organization_product`;
DROP TABLE IF EXISTS `theme`;
DROP TABLE IF EXISTS `organization_theme`;
DROP TABLE IF EXISTS `user_theme`;
DROP TABLE IF EXISTS `folder`;
DROP TABLE IF EXISTS `user_data`;
DROP TABLE IF EXISTS `chart`;
DROP TABLE IF EXISTS `chart_public`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `user_plugin_cache`;
DROP TABLE IF EXISTS `organization`;
DROP TABLE IF EXISTS `login_token`;
DROP TABLE IF EXISTS `auth_token`;
SET FOREIGN_KEY_CHECKS = 1;
