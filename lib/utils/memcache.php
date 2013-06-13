<?php

if (isset($_GLOBALS['dw-config']['memcache'])) {
    $memcfg = $_GLOBALS['dw-config']['memcache'];
    $memcache = new Memcache();
    $memcache->connect($memcfg['host'], $memcfg['port']) or die ("Could not connect");
}