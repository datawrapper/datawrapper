-- Adds export_job

-- Up
CREATE TABLE `export_job` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) DEFAULT NULL,
  `priority` int(11) DEFAULT NULL,
  `status` enum('queued','in_progress','done','failed') DEFAULT 'queued',
  `processed_at` datetime DEFAULT NULL,
  `done_at` datetime DEFAULT NULL,
  `last_task` int(11) DEFAULT NULL,
  `tasks` json DEFAULT NULL,
  `log` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `chart_id` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `chart_id` (`chart_id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8;

-- Down
DROP TABLE IF EXISTS `export_job`;
