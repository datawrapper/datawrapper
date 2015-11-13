-- ---------------------------------------------------------------------
-- organization_invite
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `organization_invite`;

CREATE TABLE `organization_invite` (
    `invite_token` VARCHAR(128) NOT NULL,
    `organization_id` VARCHAR(128) NOT NULL,
    `user_id` INTEGER NOT NULL,
    PRIMARY KEY (`invite_token`),
    INDEX `organization_invite_FI_1` (`user_id`),
    INDEX `organization_invite_FI_2` (`organization_id`)
) ENGINE=InnoDB;
