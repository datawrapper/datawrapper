-- Up
CREATE FULLTEXT INDEX chart_title_IDX ON chart (title);

-- Down
ALTER TABLE chart DROP INDEX chart_title_IDX;
