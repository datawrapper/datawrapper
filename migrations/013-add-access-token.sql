-- Adds access_token

-- Up
CREATE TABLE `access_token`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(128) NOT NULL,
    `type` VARCHAR(64) NOT NULL,
    `data` JSON NULL,
    `created_at` DATETIME NOT NULL,
    `last_used_at` DATETIME,
    PRIMARY KEY (`id`,`user_id`),
    INDEX `auth_token_FI_1` (`user_id`),
    CONSTRAINT `auth_token_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`)
) ENGINE=InnoDB CHARSET=utf8;

-- Down
DROP TABLE IF EXISTS `access_token`;
