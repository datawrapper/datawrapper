ALTER TABLE chart ADD in_folder int(11) NULL;
ALTER TABLE chart ADD CONSTRAINT chart_FK_4 FOREIGN KEY (in_folder) REFERENCES folder (folder_id);