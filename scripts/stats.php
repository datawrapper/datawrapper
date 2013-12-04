<?php

/*
 * collect some daily stats on Datawrapper, such as number of charts.
 * should run once a day via cron.
 *
 */

require_once "../lib/core/build/conf/datawrapper-conf.php";

// connect to database
$dbconn = $conf['datasources']['datawrapper']['connection'];
preg_match('/mysql\:host=([^;]+);dbname=(.*)/', $dbconn['dsn'], $m);
mysql_connect($m[1], $dbconn['user'], $dbconn['password']);
mysql_select_db($m[2]);

$queries = array(
    'charts_published' => "SELECT count(*) FROM chart WHERE last_edit_step >= 4 AND deleted = 0",
    'charts_visualized' => "SELECT count(*) FROM chart WHERE last_edit_step <= 3 AND deleted = 0",
    'charts_described' => "SELECT count(*) FROM chart WHERE last_edit_step <= 2 AND deleted = 0",
    'charts_uploaded' => "SELECT count(*) FROM chart WHERE last_edit_step <= 1 AND deleted = 0",
    'users_signed' => "SELECT count(*) FROM user WHERE role <= 2 and deleted = 0",
    'users_activated' => "SELECT count(*) FROM user WHERE role <= 1 and deleted = 0",
);

$values = array();

foreach ($queries as $key => $sql) {
    $res = mysql_query($sql);
    if ($res) {
        $row = mysql_fetch_array($res);
        $values[] = '(NOW(), "'.$key.'", '.$row[0].')';
    }
}

$store = 'INSERT INTO stats (time, metric, value) VALUES ' . implode(', ', $values). ';';
mysql_query($store);
mysql_close();
