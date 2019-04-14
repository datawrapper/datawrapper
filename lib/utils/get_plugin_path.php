<?php

function get_plugin_path() {
    return $GLOBALS['dw_config']['plugin_directory'] ?? (ROOT_PATH . 'plugins/');
}