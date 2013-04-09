<?php

/*
 * Custom save handler for Datawrapper sessions
 */


$conf = Propel::getConfiguration(PropelConfiguration::TYPE_ARRAY);

$dbconn = $conf['datasources']['datawrapper']['connection'];
preg_match('/mysql\:host=([^;]+);dbname=(.*)/', $dbconn['dsn'], $m);
$dbhost = $m[1];
$dbname = $m[2];
$dbuser = $dbconn['user'];
$dbpwd = $dbconn['password'];

mysql_connect($dbhost, $dbuser, $dbpwd);
mysql_select_db($dbname);


class DatabaseSessionHandler
{
    function open($sess_path, $sess_name) {
        return true;
    }

    function close() {
        return true;
    }

    function read($sess_id) {
        $result = mysql_query("SELECT session_data FROM session WHERE session_id = '$sess_id';");
        if (!mysql_num_rows($result)) {
            mysql_query("INSERT INTO session (session_id, date_created, last_updated) VALUES ('$sess_id', NOW(), NOW());");
            return '';
        } else {
            $res = mysql_fetch_array($result);
            //var_dump(unserialize($res['session_data']));
            //die();
            mysql_query("UPDATE session SET last_updated = NOW() WHERE session_id = '$sess_id';");
            return $res['session_data'];
        }
    }

    function write($sess_id, $data) {
        mysql_query("UPDATE session SET session_data = '$data', last_updated = NOW() WHERE session_id = '$sess_id';");
        return true;
    }

    function destroy($sess_id) {
        mysql_query("DELETE FROM session WHERE session_id = '$sess_id';");
        return true;
    }

    function gc($sess_maxlifetime) {
        mysql_query("DELETE FROM session WHERE session_data = \"slim.flash|a:0:{}\" AND last_updated < '".date('c', time()-86400*30)."'");
        return true;
    }

}

$handler = new DatabaseSessionHandler();

session_set_save_handler(
    array($handler, 'open'),
    array($handler, 'close'),
    array($handler, 'read'),
    array($handler, 'write'),
    array($handler, 'destroy'),
    array($handler, 'gc')
);