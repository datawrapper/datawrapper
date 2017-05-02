-- ---------------------------------------------------------------------
-- adding column for forkable charts
-- ---------------------------------------------------------------------

ALTER TABLE chart ADD COLUMN `forkable` TINYINT(1) DEFAULT 0;
