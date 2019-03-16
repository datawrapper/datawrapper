-- Adds schema

-- Up
CREATE TABLE `schema` (
    `scope` varchar(100) NOT NULL,
    version INT NULL,
    PRIMARY KEY (`scope`)
) ENGINE=InnoDB;

-- Down
DROP TABLE IF EXISTS `schema`;
