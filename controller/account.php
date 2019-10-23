<?php

require_once ROOT_PATH . 'controller/account/activate.php';
require_once ROOT_PATH . 'controller/account/set-password.php';
require_once ROOT_PATH . 'controller/account/reset-password.php';

require_once ROOT_PATH . 'controller/team/activate.php';
require_once ROOT_PATH . 'controller/team/create.php';
require_once ROOT_PATH . 'controller/team/invites.php';
require_once ROOT_PATH . 'controller/team/leave.php';
require_once ROOT_PATH . 'controller/team/settings.php';

call_user_func(function() {
    global $app;

    // redirect to settings
    $app->get('/settings/?', function() use ($app) {
        $app->redirect('/account');
    });

    $app->get('/account(/:tab)?', function($tab = null) use ($app) {
        disable_cache($app);

        if (Session::isLoggedIn()) {
            $user = Session::getUser();

            $pages = Hooks::execute(Hooks::GET_ACCOUNT_PAGES, $user);
            foreach ($pages as $page) {
                if (!isset($page['order'])) $page['order'] = 999;
            }
            usort($pages, function($a, $b) { return $a['order'] - $b['order']; });

            $context = [
                'svelte_data' => [
                    "user" => $user,
                    "email" => $user->getEmail(),
                    "userId" => $user->getId(),
                    'teams' => $user->getOrganizations()->toArray(),
                    'pages' => $pages
                ]
            ];

            add_header_vars($context, 'account');
            $app->render('account.twig', $context);
        }
    });

});

