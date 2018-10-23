<?php

function add_svelte_vis_controls($id, $plugin, $defaults) {

    Hooks::register(
        Hooks::VIS_OPTION_CONTROLS,
        function ($o, $k) use ($plugin, $id, $defaults) {
            if ($o['type'] == $id) {
                global $app;
                $app->render('chart/visualize/svelte-option.twig', [
                    'option' => $o,
                    'key' => $k,
                    'type' => $id,
                    'path' => 'svelte/'.$plugin->getName().'/controls',
                    'plugin' => $plugin->getName(),
                    'sha' => $plugin->getLastInstallTime(),
                    'defaults' => $defaults,
                    'userArray' => Session::getUser()->serialize(),
                    'chartLocales' => array_map(function($s) {
                        $s = explode('|', $s);
                        return ['value'=>$s[0], 'label'=>$s[1]];
                     }, explode(',', $GLOBALS['dw_config']['plugins']['chart-locale-select']['locales'] ?? 'en-US|english,de-DE|deutsch')),
                ]);
            }
        }
    );

}