<?php

/*
 * collect some daily stats on Datawrapper, such as number of charts.
 * should run once a day via cron.
 *
 */

require_once "../lib/core/build/conf/datawrapper-conf.php";

// connect to database
$dbconn  = $conf['datasources']['datawrapper']['connection'];
$db      = new PDO($dbconn['dsn'], $dbconn['user'], $dbconn['password']);
$queries = array(
    'charts_published'  => "SELECT count(*) AS c FROM chart WHERE last_edit_step >= 4 AND deleted = 0",
    'charts_visualized' => "SELECT count(*) AS c FROM chart WHERE last_edit_step <= 3 AND deleted = 0",
    'charts_described'  => "SELECT count(*) AS c FROM chart WHERE last_edit_step <= 2 AND deleted = 0",
    'charts_uploaded'   => "SELECT count(*) AS c FROM chart WHERE last_edit_step <= 1 AND deleted = 0",
    'users_signed'      => "SELECT count(*) AS c FROM user WHERE role <= 2 and deleted = 0",
    'users_activated'   => "SELECT count(*) AS c FROM user WHERE role <= 1 and deleted = 0",
    'active_users_day'  => "SELECT COUNT(*) AS c FROM session WHERE NOW() - last_updated < 86400 AND session_data != ''",
    'active_users_week' => "SELECT COUNT(*) AS c FROM session WHERE NOW() - last_updated < 604800 AND session_data != ''"
);

$values = array();

foreach ($queries as $key => $sql) {
    $res = $db->query($sql);
    if ($res) {
        $row = $res->fetch(PDO::FETCH_ASSOC);
        $values[] = '(NOW(), "'.$key.'", '.$row['c'].')';
    }
}

if (count($values) > 0) {
    $db->exec('INSERT INTO stats (time, metric, value) VALUES ' . implode(', ', $values));
}
