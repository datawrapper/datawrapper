-- Up
ALTER TABLE `user` MODIFY COLUMN email varchar(512) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;
UPDATE `user` SET email = NULL WHERE email = 'DELETED' OR email = '';
ALTER TABLE `user` ADD CONSTRAINT uniq_email UNIQUE KEY (email);

-- Down
ALTER TABLE `user` DROP KEY uniq_email;
