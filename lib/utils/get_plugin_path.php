<?php

function get_plugin_path() {
    return $GLOBALS['dw_config']['plugin_directory'] ?? (ROOT_PATH . 'plugins/');
}

function get_plugin_static_path($name) {
	return (isset($GLOBALS['dw_config']['copy_plugin_assets']) &&
            $GLOBALS['dw_config']['copy_plugin_assets'] === false) ?
		get_plugin_path() . $name . '/static/' :
		ROOT_PATH . '/www/static/plugins/' . $name . '/';
}