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
) ENGINE=InnoDB;