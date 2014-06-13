<?php

/*
 * Custom save handler for Datawrapper sessions
 */

class DatabaseSessionHandler
{
    protected $db;

    public function __construct(PDO $conn) {
        $this->db = $conn;
    }

    function open($sess_path, $sess_name) {
        return true;
    }

    function close() {
        return true;
    }

    function read($sess_id) {
        $result = $this->db->query("SELECT session_data FROM session WHERE session_id = '$sess_id'");
        if ($result->rowCount() === 0) {
            $this->db->exec("INSERT INTO session (session_id, date_created, last_updated, session_data) VALUES ('$sess_id', NOW(), NOW(), '')");
            return '';
        }

        $res = $result->fetch(PDO::FETCH_ASSOC);
        $this->db->exec("UPDATE session SET last_updated = NOW() WHERE session_id = '$sess_id'");

        return $res['session_data'];
    }

    function write($sess_id, $data) {
        $this->db->exec("UPDATE session SET session_data = '$data', last_updated = NOW() WHERE session_id = '$sess_id'");
        return true;
    }

    function destroy($sess_id) {
        $this->db->exec("DELETE FROM session WHERE session_id = '$sess_id'");
        return true;
    }

    function gc($sess_maxlifetime) {
        $this->db->exec("DELETE FROM session WHERE session_data = \"slim.flash|a:0:{}\" AND last_updated < '".date('c', time()-86400*30)."'");
        return true;
    }
}

$conf    = Propel::getConfiguration(PropelConfiguration::TYPE_ARRAY);
$dbconf  = $conf['datasources']['datawrapper']['connection'];
$pdo     = new PDO($dbconf['dsn'], $dbconf['user'], $dbconf['password']);
$handler = new DatabaseSessionHandler($pdo);

session_set_save_handler(
    array($handler, 'open'),
    array($handler, 'close'),
    array($handler, 'read'),
    array($handler, 'write'),
    array($handler, 'destroy'),
    array($handler, 'gc')
);
