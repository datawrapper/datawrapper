<?php

$plugin->registerAdminPage(function() use ($plugin) {
    return array(
        'url' => '/users',
        'title' => __('Users', $plugin->getName()),
        'controller' => function($app, $page) use ($plugin) {

            $users = UserQuery::create()
                ->orderByCreatedAt('desc')
                ->limit(100)
                ->find();

            $page['state'] = ['users' => []];

            foreach ($users as $user) {
                // serialize from PHP classes to plain objects
                $page['state']['users'][] = $user->serialize();
            }

            $app->render('plugins/admin-users/admin-users.twig', $page);
        },
        'group' => __('Users'),
        'icon' => 'fa-users',
        'order' => 1
    );
});

