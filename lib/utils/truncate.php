<?php

function truncate($text, $begin = 10, $end = 5){
    if (strlen($text) < $begin + $end + 4) return $text;
    return substr($text, 0, $begin) . '...' . substr($text, -$end);
}