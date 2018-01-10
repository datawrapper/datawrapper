-- chart_public

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `chart_public`
(
    `id` VARCHAR(5) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(200) NOT NULL,
    `metadata` JSON NOT NULL,
    `external_data` VARCHAR(255),
    PRIMARY KEY (`id`),
    CONSTRAINT `chart_public_FK_1`
        FOREIGN KEY (`id`)
        REFERENCES `chart` (`id`)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
