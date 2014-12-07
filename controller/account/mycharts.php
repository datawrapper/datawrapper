<?php

DatawrapperHooks::register(DatawrapperHooks::GET_ACCOUNT_PAGES, function() {
    return array(
        'url' => 'mycharts',
        'title' => __('My Charts'),
        'icon' => 'fa-bar-chart-o',
        'order' => 20,
        'controller' => function($app) {
            return function() use ($app) {
                $app->redirect('/mycharts');
            };
        }
    );
});

