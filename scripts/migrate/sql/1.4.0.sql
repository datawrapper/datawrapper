
CREATE TABLE `plugin`
(
    `id` VARCHAR(128) NOT NULL,
    `installed_at` DATETIME NOT NULL,
    `enabled` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;
