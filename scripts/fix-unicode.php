<?php

define('ROOT_PATH', './');
define('CLI', php_sapi_name() == "cli");
require_once ROOT_PATH . 'vendor/autoload.php';

$break_date = '2019-03-01';
$downtime = true;

function run() {
    global $downtime, $break_date;
    if ($downtime) {
        // fix everything
        fixTable('organization', ['name']);
        fixTable('theme', ['title']);
        fixTable('user', ['name', 'website']);
        fixTable('folder', ['folder_name']);
        fixTable('chart', ['title','metadata'], 'deleted = 0 AND utf8 = 0 AND last_modified_at >= "'.$break_date.'"');
        fixTable('chart_public', ['title','metadata']);
        fixTable('river_chart', ['description']);
        fixTable('river_chart_tag', ['tag']);
        // fixTable('river_chart_tag_translations', ['tag_name']);
        fixTable('auth_token', ['comment']);
    } else {
        // fix old charts before downtime
        fixTable('chart',
            ['title','metadata'],
            'deleted = 0 AND utf8 = 0 AND last_modified_at < "'.$break_date.'" AND public_version < 4'
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
    $fixed_ids = json_decode(file_get_contents('./fixed-ids.json'), true);
}

function storeFixedIds() {
    global $fixed_ids;
    file_put_contents('./fixed-ids.json', json_encode($fixed_ids, JSON_PRETTY_PRINT));
}

function fixTable($table, $fields, $add_where='') {
    global $pdo_old, $pdo_new;
    $id_field = $table === 'folder' ? 'folder_id' : 'id';
    // get ids
    $row_ids = getRowIds($table, $fields, $id_field, $add_where);

    while (count($row_ids) > 0) {
        foreach ($row_ids as $id) {
            fixTableRow($table, $fields, $id, $id_field);
        }
        storeFixedIds();
        $row_ids = getRowIds($table, $fields, $id_field, $add_where);
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
    print "\n\033[1;34mfetching next batch of $table's...\033[m\n";
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
    $fixed = quoteIds($table);
    if (!empty($fixed)) $where[] = $id_field.' NOT IN ('.implode(', ', $fixed).')';
    $where[] = implode(' OR ', $check);
    if (!empty($add_where)) $where[] = $add_where;
    // print 'SELECT '.$id_field.' FROM '.$table.' WHERE ('.implode(') AND (', $where).') LIMIT 1000';
    return $pdo_old->query('SELECT '.$id_field.' FROM '.$table.' WHERE ('.implode(') AND (', $where).') LIMIT 10000')->fetchAll(PDO::FETCH_COLUMN, 0);
}

function fixTableRow($table, $fields, $id, $id_field) {
    global $pdo_old, $pdo_new, $fixed_ids;
    $row = $pdo_old->query('SELECT '.implode(', ', $fields).' FROM '.$table.' WHERE '.$id_field.' = '.$pdo_old->quote($id))->fetch(PDO::FETCH_ASSOC);
    $update = [];
    foreach ($fields as $field) {
        $update[] = $field.' = '.$pdo_new->quote($row[$field]);
    }
    if ($table === 'chart') $update[] = 'utf8 = 1';
    if (!isset($fixed[$table])) $fixed[$table] = [];
    try {
        $pdo_new->query('UPDATE '.$table.' SET '.implode(', ', $update).' WHERE '.$id_field.' = '.$pdo_new->quote($id));
        print "$id ";
    } catch (Exception $e) {
        $msg = $e->getMessage();
        $worked = false;
        if (strpos($msg, 'Incorrect string value') > -1) {
            preg_match('#for column \'([^\']+)\'#', $msg, $m);
            if (isset($m[1])) {
                $field = $m[1];
                foreach ($update as $key => $value) {
                    if (substr($value, 0, strlen($field)+2) === $field.' =') {
                        $update[$key] = $value = $field.' = '.$pdo_new->quote(substr($row[$field], 0, strlen($row[$field])-1));
                        // re-try update
                        try {
                            $pdo_new->query('UPDATE '.$table.' SET '.implode(', ', $update).' WHERE '.$id_field.' = '.$pdo_new->quote($id));
                            print "\033[1;33m$id\033[m ";
                            $worked = true;
                        } catch (Exception $f) {}
                    }
                }
            }
        }
        if (!$worked) {
            print $msg."\n";
            print "\033[1;31m$id\033[m ";
            $fixed_ids[$table][] = $id;
        }
    }
    if ($table !== 'chart') {
        $fixed_ids[$table][] = $id;
    }
}

$t0 = microtime(true);
run();
// fixTableRow('chart', ['title'], '7WOfu', 'id');

$t1 = microtime(true);

print "took ".(1000*($t1 - $t0))." milliseconds\n";
