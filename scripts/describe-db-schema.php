<?php

define('ROOT_PATH', './');
define('CLI', php_sapi_name() == "cli");
require_once ROOT_PATH . 'vendor/autoload.php';

Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf.php");
$pdo = Propel::getConnection();

$tables = $pdo->query('SHOW tables')->fetchAll(PDO::FETCH_COLUMN, 0);

$out = [];

foreach ($tables as $table) {
    $out[$table] = [
        'columns' => []
    ];
    $res = $pdo->query('SHOW FULL COLUMNS FROM `'.$table.'`')->fetchAll(PDO::FETCH_ASSOC);
    foreach ($res as $row) {
        $col = [];
        foreach ($row as $key => $value) {
            $col[strtolower($key)] = $value;
        }
        if (!empty($col['collation'])) {
            $col['charset'] = substr($col['collation'], 0, strpos($col['collation'], '_'));
        }
        $out[$table]['columns'][] = $col;
    }
}

file_put_contents('db-schema.json', json_encode($out, JSON_PRETTY_PRINT));