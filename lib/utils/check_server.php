<?php

/* health check */

function check_path_permissions() {
    $paths = array();
    $rel = '..';
    $paths[] = '/charts/static';
    $paths[] = '/charts/data';
    $paths[] = '/charts/images';
    $paths[] = '/charts/data/tmp';
    $paths[] = '/vendor/htmlpurifier/standalone/HTMLPurifier/DefinitionCache/Serializer';
    $err = array();
    foreach ($paths as $path) {
        if (!is_writable($rel . $path)) $err[] = $path;
    }
    if (count($err) > 0) {
        $msg = '<h2>The following folders on your server need to be writable:</h2><ul>';
        foreach ($paths as $path) {
            # code...
            $msg .= '<li><code>'.dirname(dirname(dirname(__FILE__))).$path.'</code></li>';
        }
        $msg .= '</ul>';
        $msg .= 'Read more about <a href="http://codex.wordpress.org/Changing_File_Permissions#Using_an_FTP_Client">how to change file permissions</a>';
        return $msg;
    }
    return '';
}

function check_config() {
    if (!file_exists('../config.yaml')) {
        return '<h2>Could not find <b>config.yaml</b></h2>'
          . '<p>Please copy the template configuration from <code>config.template.yaml</code> to <code>config.yaml</code> and change the configuration according to your server.</p>';
    }
    return '';
}


function check_database() {
    if (!file_exists('../lib/core/build/conf/datawrapper-conf.php')) {
        return '<h2>No database configuration found!</h2>'
            . '<p>Please copy <code>lib/core/build/conf/datawrapper-conf.php.master</code> to <code>'
            . 'lib/core/build/conf/datawrapper-conf.php</code> and update your database settings '
            . 'according to your server configuration</p>';
    }
    @include '../lib/core/build/conf/datawrapper-conf.php';
    $dbconn = $conf['datasources']['datawrapper']['connection'];
    preg_match('/mysql\:host=([^;]+);dbname=(.*)/', $dbconn['dsn'], $m);
    $link = mysql_connect($m[1], $dbconn['user'], $dbconn['password']);
    if ($link === false) {
        return '<h2>Could not access database!</h2><p>'. mysql_error() . '</p>';
    }
    $link = mysql_select_db($m[2]);
    if ($link === false) {
        return '<h2>Could not access database!</h2><p>'. mysql_error() . '</p>';
    }
    // check if we find the tables
    $res = mysql_query('SHOW TABLES;');
    $expectedTables = array('action', 'chart', 'job', 'session', 'stats', 'user');
    $foundTables = array();
    while ($row = mysql_fetch_row($res)) {
        $foundTables[] = $row[0];
    }
    $missingTables = array_diff($expectedTables, $foundTables);
    if (count($missingTables) > 0) {
        return '<h2>Database is not initialized or corrupt</h2>'
            . '<p>The database could be accessed but seems not be initialized correctly. '
            . 'The following tables are missing:</p>'
            . '<ul><li><code>' . join('</li></code><li><code>', $missingTables) . '</code></li></ul>'
            . '<p>Have you run the DB initialization in <code>lib/core/build/sql/schema.sql</code>?</p>';
    }
    return '';
}

function check_plugins() {
    $res = mysql_query('SELECT id FROM plugin WHERE enabled = 1');
    $missing = array();
    while ($row = mysql_fetch_assoc($res)) {
        if (!file_exists(ROOT_PATH . 'plugins/' . $row['id'] . '/package.json')) {
            $missing[] = $row['id'];
        }
    }
    if (count($missing) > 0) {
        return '<h2>Some plugins are missing</h2>'
            . '<p>The following plugins are activated in the database but the corresponding '
            . 'files could not be found:</p>'
            . '<ul><li><code>'. join('</li></code><li><code>', $missing) . '</code></li></ul>';
    }
}

function check_server() {
    $check = array();
    $check[] = 'check_config';
    $check[] = 'check_path_permissions';
    $check[] = 'check_database';
    $check[] = 'check_plugins';

    foreach ($check as $func) {
        $msg = call_user_func($func);
        if (!empty($msg)) {
            print '<html><head><title>Datawrapper</title></head><body>';
            print '<div style="border-radius:20px;background:#ffc; border:1px solid #eea; padding: 30px;width:700px;margin:30px auto;font-size:18px;font-family:Helvetica Neue;font-weight:300">';
            print '<style>h2 { font-weight: 400; font-size: 28px; color: #b20 } ul li { font-size: 18px }</style>';
            print '<h1 style="margin:0 0 30px;font-size:32px;line-height:30px;letter-spacing:-1px;color:#531">Whoops! Something is wrong with your Datawrapper instance!</h1>';

            print $msg;
            print '</div></body></html>';
            exit();
        }
     }
}