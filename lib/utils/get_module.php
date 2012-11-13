<?php

function get_module($type, $pathToLib = '../../lib/') {
    if ($type != 'analytics' && $type != 'publish') {
        throw new Exception("Unknown module type ".$type, 1);
    }
    if (!empty($GLOBALS['dw_config'][$type])) {
        $cfg = $GLOBALS['dw_config'][$type];
        // try to load class
        $cl = $pathToLib . 'modules/' . $type . '/' . $cfg['type'] . '.php';
        if (file_exists($cl)) {
            try {
                include_once $cl;
                $className = 'Datawrapper_'.strtoupper($type[0]) . substr($type, 1).'_' . $cfg['type'];
                $mod = new $className();
                return $mod;
            } catch (Exception $e) {
                throw $e;
                return false;
            }
        }
        throw new Exception("Class not found ".$cl, 1);
        return false;
    }
}

