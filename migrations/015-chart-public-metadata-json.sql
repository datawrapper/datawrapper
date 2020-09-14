-- Up
ALTER TABLE chart_public MODIFY COLUMN metadata json NOT NULL;

-- Down
ALTER TABLE chart_public MODIFY COLUMN metadata longtext NOT NULL;