
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
	`metadata` VARCHAR(4096) NOT NULL,
	`deleted` TINYINT(1) DEFAULT 0,
	`deleted_at` DATETIME,
	`author_id` INTEGER NOT NULL,
	`show_in_gallery` TINYINT(1) DEFAULT 0,
	`language` VARCHAR(5) DEFAULT '',
	`guest_session` VARCHAR(255),
	`last_edit_step` INTEGER DEFAULT 0,
	`published_at` DATETIME,
	`public_url` VARCHAR(255),
	PRIMARY KEY (`id`),
	INDEX `chart_FI_1` (`author_id`),
	CONSTRAINT `chart_FK_1`
		FOREIGN KEY (`author_id`)
		REFERENCES `user` (`id`)
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
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;

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
	`session_data` VARCHAR(4096) NOT NULL,
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
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
