-- Adds chart.utf8

-- Up
ALTER TABLE chart ADD COLUMN utf8 TINYINT(1) DEFAULT 0;

-- Down
ALTER TABLE chart DROP COLUMN utf8;