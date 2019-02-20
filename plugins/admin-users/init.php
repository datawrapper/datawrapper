<?php

$plugin->registerAdminPage(function() use ($plugin) {
    return array(
        'url' => '/users',
        'title' => __('Users', $plugin->getName()),
        'controller' => function($app, $page) use ($plugin) {
            $app->render('plugins/admin-users/admin-users.twig', $page);
        },
        'group' => __('Users'),
        'icon' => 'fa-users',
        'order' => 1
    );
});

