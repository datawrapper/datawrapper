<?php

define('ROOT_PATH', './');
define('CLI', php_sapi_name() == "cli");
require_once ROOT_PATH . 'vendor/autoload.php';

$downtime = true;

function run() {
    global $downtime;
    if ($downtime) {
        // fix everything
        fixTable('organization', ['name']);
        fixTable('theme', ['title', 'data']);
        fixTable('user', ['name', 'website']);
        fixTable('folder', ['folder_name']);
        fixTable('chart', ['title','metadata']);
        fixTable('chart_public', ['title','metadata']);
    } else {
        // fix old charts before downtime
        fixTable('chart_public',
            ['title','metadata'],
            'NOW() - last_modified_at > 86400 * 90 AND public_version < 4'
        );
    }
}

// old db connection
Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf-latin.php");
$pdo_old = Propel::getConnection();

// new, utf-8 db connection
Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf-utf8.php");
$pdo_new = Propel::getConnection();

$fixed_ids = [];
if (file_exists('./fixed-ids.json')) {
    $fixed_ids = json_decode(file_get_contents('./fixed-ids.json'));
}

function storeFixedIds() {
    global $fixed_ids;
    file_put_contents('./fixed-ids.json', $fixed_ids);
}

function fixTable($table, $fields, $add_where='') {
    global $pdo_old, $pdo_new;
    $id_field = $table === 'folder' ? 'folder_id' : 'id';
    // get ids
    $row_ids = getRowIds($table, $fields, $id_field, $add_where);
    while (count($row_ids) > 0) {
        foreach ($row_ids as $id) {
            fixTableRow($table, $fields, $id, $id_field);
            $fixed++;
        }
        storeFixedIds();
        print "fetching next batch of charts...\n";
        $row_ids = getChartIds(true);
    }
}

function quoteIds($table) {
    global $fixed_ids, $pdo_new;
    $ids = [];
    foreach ($fixed_ids[$table] ?? [] as $id) {
        $ids[] = $pdo_new->quote($id);
    }
    return $ids;
}

function getRowIds($table, $fields, $id_field, $add_where) {
    global $pdo_old, $pdo_new, $fixed_ids;
    $check = [];
    foreach ($fields as $field) {
        if ($field === 'metadata' || $field === 'data') {
            // ignore first character for json data fields
            $check[] = 'CONVERT(SUBSTRING('.$field.',1) USING ascii) != SUBSTRING('.$field.', 1)';
        } else {
            $check[] = 'CONVERT('.$field.' USING ascii) != '.$field;
        }
    }
    $where = [];
    // ignore ids that have been fixed already
    $where[] = $id_field.' NOT IN ('.implode(', ', quoteIds($table)).')';
    $where[] = implode(' OR ', $where);
    if (!empty($add_where)) $where[] = $add_where;
    return $pdo_old->query('SELECT '.$id_field.' FROM '.$table.' WHERE '.implode(' AND '.$where).' LIMIT 1000')->fetchAll(PDO::FETCH_COLUMN, 0);
}

function fixTableRow($table, $fields, $id, $id_field, $add_update) {
    global $pdo_old, $pdo_new, $fixed_ids;
    $row = $pdo_old->query('SELECT '.implode(', ', $fields).' FROM '.$table.' WHERE '.$id_field.' = '.$pdo_old->quote($id))->fetch(PDO::FETCH_ASSOC);
    $update = [];
    foreach ($fields as $field) {
        $update[] = $field.' = '.$pdo_new->quote($row[$field]);
    }
    $pdo_new->query('UPDATE '.$table.' SET '.implode(', ', $update).' WHERE '.$id_field.' = '.$pdo_new->quote($id));
    if (!isset($fixed[$table])) $fixed[$table] = [];
    $fixed_ids[$table][] = $id;
}

$t0 = microtime(true);
run();
$t1 = microtime(true);

print "took ".(1000*($t1 - $t0))." milliseconds\n";
