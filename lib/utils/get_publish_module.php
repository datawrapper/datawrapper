<?php

function get_publish_module($pathToLib = '../../lib/') {
    if (!empty($GLOBALS['dw_config']['publish'])) {
        $cfg = $GLOBALS['dw_config']['publish'];
        // try to load class
        $cl = $pathToLib . "modules/publish/" . $cfg['type'] . ".php";
        if (file_exists($cl)) {
            try {
                include_once $cl;
                $className = 'Datawrapper_Publish_' . $cfg['type'];
                $pub = new $className();
                return $pub;
            } catch (Exception $e) {
                throw $e;
                return false;
            }
        }
        throw new Exception("Class not found ".$cl, 1);
        return false;
    }
}
