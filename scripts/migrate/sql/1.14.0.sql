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
) ENGINE=InnoDB CHARACTER SET='utf8';

ALTER TABLE chart ADD in_folder int(11) NULL;
ALTER TABLE chart ADD CONSTRAINT chart_FK_4 FOREIGN KEY (in_folder) REFERENCES folder (folder_id);


-- ---------------------------------------------------------------------
-- user_data
-- ---------------------------------------------------------------------

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
) ENGINE=InnoDB;