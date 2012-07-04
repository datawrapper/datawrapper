<?php

define('DW_ROOT', dirname(dirname(__FILE__)));

require_once DW_ROOT . '/lib/utils/alphaID.php';

$ids = split("\n", trim(file_get_contents(DW_ROOT . "/scripts/legacy-ids.txt")));

print $ids;

foreach ($ids as $id) {
    $num_id = alphaID($id, true);
    print $id;
    // load html
    $html = file_get_contents('http://datawrapper.de/?c='.$id);
    file_put_contents(DW_ROOT . '/www/legacy/' . $id . '.html', $html);

    // load data
    $csv = file_get_contents('http://datawrapper.de/actions/export.php?c='.$num_id);
    file_put_contents(DW_ROOT . '/www/legacy/data/'. $num_id . '.csv', $csv);
}

