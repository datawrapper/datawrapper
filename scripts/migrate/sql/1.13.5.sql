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
