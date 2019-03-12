-- Up
ALTER TABLE chart MODIFY COLUMN metadata json NOT NULL;

-- Down
ALTER TABLE chart MODIFY COLUMN metadata longtext NOT NULL;