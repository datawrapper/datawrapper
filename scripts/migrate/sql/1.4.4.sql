ALTER TABLE chart ADD COLUMN `public_version` INTEGER DEFAULT 0;

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