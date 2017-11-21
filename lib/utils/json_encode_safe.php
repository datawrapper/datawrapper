<?php

function json_encode_safe($arr) {
    $mask = 0;
    if (!empty($opts)) {
        if (!empty($opts['pretty'])) $mask = $mask | JSON_PRETTY_PRINT;
    }
    // PHP's json_encode has this *very* annoying behavior of failing
    // quietly on non-unicode input. to fix this we're running
    // through the entire array and checking for the correct
    // encoding, and trying to fix it if needed.
    if (is_array($arr)) {
        array_walk_recursive ($arr, function (&$a) {
            if (is_string($a) && !mb_check_encoding($a, 'UTF-8')) {
                $a = utf8_encode($a);
            }
        });
    }
    return json_encode($arr, $mask);
}