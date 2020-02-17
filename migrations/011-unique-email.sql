-- Up
UPDATE `user` SET email = NULL WHERE email = 'DELETED' OR email = '';
ALTER TABLE `user` ADD CONSTRAINT uniq_email UNIQUE KEY (email);

-- Down
ALTER TABLE `user` DROP KEY uniq_email;
