<?php

/*
 * parses the config and populates some defaults
 */

function parse_config() {
    $cfg = $GLOBALS['dw_config'];

    // check that email adresses are set
    if (!isset($cfg['email']))
        $cfg['email'] = array();
    if (!isset($cfg['email']['admin']))
        $cfg['email']['admin'] = 'admin@' . $cfg['domain'];
    if (!isset($cfg['email']['log']))
        $cfg['email']['log'] = 'admin@' . $cfg['domain'];
    if (!isset($cfg['email']['pwd_reset']))
        $cfg['email']['pwd_reset'] = 'password-reset@' . $cfg['domain'];
    if (!isset($cfg['email']['activate']))
        $cfg['email']['activate'] = 'activate-reset@' . $cfg['domain'];

    $GLOBALS['dw_config'] = $cfg;
}