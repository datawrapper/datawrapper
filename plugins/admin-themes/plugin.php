<?php

class DatawrapperPlugin_AdminThemes extends DatawrapperPlugin {

    public function init() {
        $plugin = $this;
        // register plugin controller
        DatawrapperHooks::register(
            DatawrapperHooks::GET_ADMIN_PAGES,
            function() use ($plugin) {
                return array(
                    'url' => '/themes',
                    'title' => __('Themes', $plugin->getName()),
                    'controller' => array($plugin, 'themesAdmin'),
                    'order' => '3'
                );
            }
        );
    }

    /*
     * controller for themes admin
     */
    public function themesAdmin($app, $page) {
        $page = array_merge($page, array(
            'title' => 'Themes',
            'themes' => DatawrapperTheme::all(),
            'count' => count_charts_per_themes()
        ));
        $app->render('plugins/admin-themes/admin-themes.twig', $page);
    }

}
