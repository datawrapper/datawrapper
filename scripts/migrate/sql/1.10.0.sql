-- ---------------------------------------------------------------------
-- organization_invite
-- ---------------------------------------------------------------------

ALTER TABLE user_organization ADD COLUMN `invite_token` VARCHAR(128) DEFAULT '' NOT NULL;
