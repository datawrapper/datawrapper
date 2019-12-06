-- Up
ALTER TABLE organization MODIFY COLUMN name varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;

-- Down