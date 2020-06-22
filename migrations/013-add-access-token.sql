-- Adds access_token

-- Up
CREATE TABLE `access_token` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `token` varchar(128) NOT NULL,
    `type` varchar(100) NOT NULL,
    `data` json DEFAULT NULL,
    `created_at` datetime NOT NULL,
    `last_used_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `access_token_token_IDX` (`token`) USING BTREE,
    KEY `access_token_user_id_IDX` (`user_id`) USING BTREE,
    KEY `access_token_type_IDX` (`type`) USING BTREE,
    CONSTRAINT `access_token_FK` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO access_token
    (user_id, token, type, created_at, last_used_at, data)
    SELECT user_id, token, "api-token", created_at, last_used_at,
        JSON_OBJECT('comment', comment) FROM auth_token;

-- Down
DROP TABLE IF EXISTS `access_token`;
