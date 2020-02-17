-- Up
UPDATE `user` SET email = CONCAT('DELETED/', id) WHERE email = 'DELETED';
UPDATE `user` SET email = NULL WHERE email = '';
ALTER TABLE `user` ADD CONSTRAINT uniq_email UNIQUE KEY (email);

-- Down
ALTER TABLE `user` DROP KEY uniq_email;
