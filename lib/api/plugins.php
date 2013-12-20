<?php

/*
 * this API endpoint allows plugins to provide custom
 * API actions
 */

// change plugin status
$app->put('/plugins/:id/:action', function($plugin_id, $action) use ($app) {
    if_is_admin(function() use ($plugin_id, $action) {
        $plugin = PluginQuery::create()->findPk($plugin_id);
        if ($plugin) {
            switch ($action) {
                case 'enable': $plugin->setEnabled(true); break;
                case 'disable': $plugin->setEnabled(false); break;
                case 'publish': $plugin->setIsPrivate(false); break;
                case 'unpublish': $plugin->setIsPrivate(true); break;
            }
            $plugin->save();
            ok();
        } else {
            error('plugin-not-found', 'No plugin found with that ID');
        }
    });
})->conditions(array('action' => '(enable|disable|publish|unpublish)'));


$pluginApiHooks = DatawrapperHooks::execute(DatawrapperHooks::PROVIDE_API);

if (!empty($pluginApiHooks)) {
    foreach ($pluginApiHooks as $hook) {
        if (!isset($hook['method'])) $hook['method'] = 'GET';
        $app->map('/plugin/' . $hook['url'], $hook['action'])->via($hook['method']);
    }
}

