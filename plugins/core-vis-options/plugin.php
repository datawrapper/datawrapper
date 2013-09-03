<?php

class DatawrapperPlugin_CoreVisOptions extends DatawrapperPlugin {

    public function init() {
        $plugin = $this;
        global $app;

        DatawrapperHooks::register(
            DatawrapperHooks::VIS_OPTION_CONTROLS,
            function($o, $k) use ($app, $plugin) {
                $env = array('option' => $o, 'key' => $k);
                $app->render('plugins/' . $plugin->getName() . '/controls.twig', $env);
            }
        );

        DatawrapperHooks::register(DatawrapperHooks::GET_PLUGIN_ASSETS, function($uri) use ($plugin) {
            if (preg_match("|/chart/[^/]+/visualize|", $uri)) {
                return array(
                    $plugin->getName() . '/sync-controls.js',
                    $plugin->getName() . '/styles.css'
                );
            }
            return array();
        });
    }
}