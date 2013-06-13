<?php

/*
 * this API endpoint allows plugins to provide custom
 * API actions
 */


$pluginApiHooks = DatawrapperHooks::execute(DatawrapperHooks::PROVIDE_API);

if (!empty($pluginApiHooks)) {
    foreach ($pluginApiHooks as $hook) {
        if (!isset($hook['method'])) $hook['method'] = 'GET';
        $app->map('/plugin/' . $hook['url'], $hook['action'])->via($hook['method']);
    }
}

