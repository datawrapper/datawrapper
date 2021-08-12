-- Up
ALTER TABLE chart ADD keywords TEXT NULL;
CREATE FULLTEXT INDEX chart_fts_IDX ON chart (title, keywords);

CREATE TRIGGER insert_keywords BEFORE INSERT ON chart
FOR EACH ROW SET NEW.keywords = LOWER(CONCAT(
  COALESCE(NEW.metadata->>"$.describe.intro", ""), ". ",
  COALESCE(NEW.metadata->>"$.describe.\"source-name\"", ""),". ",
  COALESCE(NEW.metadata->>"$.describe.\"aria-description\"", ""), ". ",
  COALESCE(NEW.metadata->>"$.annotate.\"notes\"", ""), ". ",
  COALESCE(REPLACE(REPLACE(NEW.metadata->>"$.custom.*", '[', ' '), ']', ''), "")
));

CREATE TRIGGER update_keywords BEFORE UPDATE ON chart
FOR EACH ROW SET NEW.keywords = LOWER(CONCAT(
  COALESCE(NEW.metadata->>"$.describe.intro", ""), ". ",
  COALESCE(NEW.metadata->>"$.describe.\"source-name\"", ""), ". ",
  COALESCE(NEW.metadata->>"$.describe.\"aria-description\"", ""), ". ",
  COALESCE(NEW.metadata->>"$.annotate.\"notes\"", ""), ". ",
  COALESCE(REPLACE(REPLACE(NEW.metadata->>"$.custom.*", '[', ' '), ']', ''), "")
));


-- Down
ALTER TABLE chart DROP TRIGGER update_keywords;
ALTER TABLE chart DROP TRIGGER insert_keywords;
ALTER TABLE chart DROP INDEX chart_fts_IDX;
ALTER TABLE chart DROP COLUMN keywords;

