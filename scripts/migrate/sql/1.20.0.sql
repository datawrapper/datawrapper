-- auth_token

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `auth_token`
	(
	    `id` INTEGER NOT NULL AUTO_INCREMENT,
	    `user_id` INTEGER NOT NULL,
	    `token` VARCHAR(1024) NOT NULL,
	    PRIMARY KEY (`id`,`user_id`),
	    INDEX `auth_token_FI_1` (`user_id`),
	    CONSTRAINT `auth_token_FK_1`
	        FOREIGN KEY (`user_id`)
	        REFERENCES `user` (`id`)
	) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
