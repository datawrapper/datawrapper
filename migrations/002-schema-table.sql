-- Up
CREATE TABLE `schema` (
    `scope` varchar(100) NOT NULL,
    version INT NULL
) ENGINE=InnoDB;

-- Down
DROP TABLE IF EXISTS `schema`;
