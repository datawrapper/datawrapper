-- make job.user_id and job.chart_id optional
ALTER TABLE job MODIFY COLUMN user_id int(11) NULL ;
ALTER TABLE job MODIFY COLUMN chart_id varchar(5) NULL ;
