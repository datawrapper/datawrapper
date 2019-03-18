<?php

/*
 * parses the config and populates some defaults
 */

function parse_config($cfg) {
    // replace environment variables in config.yaml
    // the expected format is $_ENV[...], e.g. $_ENV[DW_DATABASE_USER]
    array_walk_recursive($cfg, function(&$value, $key) {
        while (preg_match('/\$_ENV\[([^\]]+)\]/', $value, $matches)) {
            $value = str_replace('$_ENV['.$matches[1].']', getenv($matches[1]), $value);
        }
    });

    // check that email adresses are set
    if (!isset($cfg['email']))
        $cfg['email'] = array();

    if (!isset($cfg['email']['support']))
        $cfg['email']['support'] = 'support@' . $cfg['domain'];

    if (!isset($cfg['email']['log']))
        $cfg['email']['log'] = 'admin@' . $cfg['domain'];

    if (!isset($cfg['email']['error']))
        $cfg['email']['error'] = 'error@' . $cfg['domain'];

    if (!isset($cfg['asset_domain']))
        $cfg['asset_domain'] = false;

    return $cfg;
}