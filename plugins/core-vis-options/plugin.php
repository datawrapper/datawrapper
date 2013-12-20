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

        DatawrapperHooks::register(
            DatawrapperHooks::VIS_OPTION_CONTROLS,
            function($o, $k) use ($app, $plugin) {
                $env = array('option' => $o, 'key' => $k);
                $app->render('plugins/' . $plugin->getName() . '/colorselector.twig', $env);
            }
        );

        $this->declareAssets(array(
            'sync-controls.js',
            'sync-colorselector.js',
            'colorpicker.css'
        ), "|/chart/[^/]+/visualize|");

    }
}