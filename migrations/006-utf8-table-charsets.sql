-- Up
SET @old_sql_mode := @@sql_mode ;
SET @new_sql_mode := @old_sql_mode ;
SET @new_sql_mode := TRIM(BOTH ',' FROM REPLACE(CONCAT(',',@new_sql_mode,','),',NO_ZERO_DATE,'  ,','));
SET @new_sql_mode := TRIM(BOTH ',' FROM REPLACE(CONCAT(',',@new_sql_mode,','),',NO_ZERO_IN_DATE,',','));
SET @@sql_mode := @new_sql_mode ;

ALTER TABLE chart MODIFY COLUMN published_at datetime NULL;
ALTER TABLE `user` MODIFY COLUMN created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL;

ALTER TABLE `action` DEFAULT CHARSET=utf8mb4;
ALTER TABLE `action` DEFAULT CHARSET=utf8mb4;
ALTER TABLE auth_token DEFAULT CHARSET=utf8mb4;
ALTER TABLE chart DEFAULT CHARSET=utf8mb4;
ALTER TABLE chart_public DEFAULT CHARSET=utf8mb4;
ALTER TABLE export_job DEFAULT CHARSET=utf8mb4;
ALTER TABLE folder DEFAULT CHARSET=utf8mb4;
ALTER TABLE job DEFAULT CHARSET=utf8mb4;
ALTER TABLE login_token DEFAULT CHARSET=utf8mb4;
ALTER TABLE organization DEFAULT CHARSET=utf8mb4;
ALTER TABLE organization_product DEFAULT CHARSET=utf8mb4;
ALTER TABLE organization_theme DEFAULT CHARSET=utf8mb4;
ALTER TABLE plugin DEFAULT CHARSET=utf8mb4;
ALTER TABLE plugin_data DEFAULT CHARSET=utf8mb4;
ALTER TABLE plugin_organization DEFAULT CHARSET=utf8mb4;
ALTER TABLE product DEFAULT CHARSET=utf8mb4;
ALTER TABLE product_plugin DEFAULT CHARSET=utf8mb4;
ALTER TABLE `schema` DEFAULT CHARSET=utf8mb4;
ALTER TABLE `session` DEFAULT CHARSET=utf8mb4;
ALTER TABLE stats DEFAULT CHARSET=utf8mb4;
ALTER TABLE theme DEFAULT CHARSET=utf8mb4;
ALTER TABLE `user` DEFAULT CHARSET=utf8mb4;
ALTER TABLE user_data DEFAULT CHARSET=utf8mb4;
ALTER TABLE user_organization DEFAULT CHARSET=utf8mb4;
ALTER TABLE user_plugin_cache DEFAULT CHARSET=utf8mb4;
ALTER TABLE user_product DEFAULT CHARSET=utf8mb4;
ALTER TABLE user_theme DEFAULT CHARSET=utf8mb4;

ALTER TABLE chart MODIFY COLUMN title varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE chart_public MODIFY COLUMN title varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE folder MODIFY COLUMN folder_name varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL;
ALTER TABLE organization MODIFY COLUMN name varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE theme MODIFY COLUMN title varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL;
ALTER TABLE organization MODIFY COLUMN name varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `user` MODIFY COLUMN name varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL;
ALTER TABLE `user` MODIFY COLUMN website varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL;

SET @@sql_mode := @old_sql_mode ;

-- Down