-- Adds user_organization.invited_by, user_organization.invited_at

-- Up
ALTER TABLE user_organization ADD `invited_by` INTEGER NULL;
ALTER TABLE user_organization ADD `invited_at` DATETIME NULL;

ALTER TABLE user_organization ADD CONSTRAINT user_organization_FK_3
    FOREIGN KEY (invited_by) REFERENCES `user`(id) ON DELETE SET NULL ON UPDATE CASCADE;

# make everyone being invited by the team owner
UPDATE user_organization a
    INNER JOIN user_organization b ON a.organization_id = b.organization_id AND b.organization_role = 0
    SET a.invited_by = b.user_id
    WHERE a.invited_by IS NULL;

# make everyone being invited_at whenever the team/user was created
# (depending on whichever was created last)
UPDATE user_organization a
    INNER JOIN organization b ON a.organization_id = b.id
    INNER JOIN user c ON a.user_id = c.id
    SET a.invited_at = GREATEST(b.created_at, c.created_at)
    WHERE a.invited_at IS NULL;

ALTER TABLE user_organization MODIFY COLUMN `invited_at` datetime NOT NULL;


-- Down
ALTER TABLE user_organization DROP FOREIGN KEY user_organization_FK_3;
ALTER TABLE user_organization DROP COLUMN `invited_at`;
ALTER TABLE user_organization DROP COLUMN `invited_by`;