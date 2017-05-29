-- ---------------------------------------------------------------------
-- theme
-- ---------------------------------------------------------------------

CREATE TABLE `theme`
(
    `id` VARCHAR(128) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `extend` VARCHAR(128),
    `title` VARCHAR(128),
    `data` LONGTEXT,
    PRIMARY KEY (`id`)
) ENGINE=MyISAM;

-- ---------------------------------------------------------------------
-- organization_theme
-- ---------------------------------------------------------------------

CREATE TABLE `organization_theme`
(
    `organization_id` VARCHAR(128) NOT NULL,
    `theme_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`organization_id`,`theme_id`),
    INDEX `organization_theme_FI_2` (`theme_id`)
) ENGINE=MyISAM;

-- ---------------------------------------------------------------------
-- user_theme
-- ---------------------------------------------------------------------

CREATE TABLE `user_theme`
(
    `user_id` INTEGER NOT NULL,
    `theme_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`user_id`,`theme_id`),
    INDEX `user_theme_FI_2` (`theme_id`)
) ENGINE=MyISAM;

-- ---------------------------------------------------------------------
-- adding column for theme less
-- ---------------------------------------------------------------------

ALTER TABLE `theme` ADD COLUMN `less` LONGTEXT;
