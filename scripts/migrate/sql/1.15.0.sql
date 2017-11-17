SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `user_plugin_cache`
(
    `user_id` INTEGER NOT NULL,
    `plugins` LONGTEXT NOT NULL,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `user_plugin_cache_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`)
) ENGINE=InnoDB;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
