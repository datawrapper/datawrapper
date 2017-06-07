-- ---------------------------------------------------------------------
-- adding column for is_fork charts
-- ---------------------------------------------------------------------

ALTER TABLE chart ADD COLUMN `is_fork` TINYINT(1) DEFAULT 0;
