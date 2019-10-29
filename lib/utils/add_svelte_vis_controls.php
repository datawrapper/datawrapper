<?php

function add_svelte_vis_controls($id, $plugin, $defaults, $path = 'controls') {

    Hooks::register(
        Hooks::VIS_OPTION_CONTROLS,
        function ($o, $k) use ($plugin, $id, $defaults, $path) {
            if ($o['type'] == $id) {
                global $app;
                $app->render('chart/visualize/svelte-option.twig', [
                    'option' => $o,
                    'key' => $k,
                    'type' => $id,
                    'filePath' => $plugin->getName().'/'.$path,
                    'amdPath' => 'svelte/'.$plugin->getName().'/'.$path,
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