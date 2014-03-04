<?php

/*
 * parses the config and populates some defaults
 */

function parse_config() {
    $cfg = $GLOBALS['dw_config'];

    // check that email adresses are set
    if (!isset($cfg['email']))
        $cfg['email'] = array();

    if (!isset($cfg['email']['support']))
        $cfg['email']['support'] = 'support@' . $cfg['domain'];

    if (!isset($cfg['email']['log']))
        $cfg['email']['log'] = 'admin@' . $cfg['domain'];

    if (!isset($cfg['email']['error']))
        $cfg['email']['error'] = 'error@' . $cfg['domain'];

    if (!isset($cfg['cdn_asset_base_url']))
        $cfg['cdn_asset_base_url'] = false;

    $GLOBALS['dw_config'] = $cfg;
}