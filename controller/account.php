<?php

require_once ROOT_PATH . 'controller/account/activate.php';
require_once ROOT_PATH . 'controller/account/set-password.php';
require_once ROOT_PATH . 'controller/account/reset-password.php';

call_user_func(function() {
    global $app;

    Hooks::register(
        Hooks::GET_ACCOUNT_PAGES, function() {
        return array(
            'order' => 100,
            'controller' => function ($app, $user) {
              return function() use ($app, $user) {
                $app->render('account/edit-profile.twig', array(
                    "svelte_data" => [
                        "email" => $user->getEmail(),
                        "userId" => $user->getId()
                    ]
                ));
              };
            }
        );
    });

    Hooks::register(
        'render_account_pages',
        function () use ($app) {
            $user = Session::getUser();

            $context = array(
                "user" => $user
            );

            $pages = Hooks::execute(Hooks::GET_ACCOUNT_PAGES, $user);

            foreach ($pages as $page) {
                if (!isset($page['order'])) $page['order'] = 999;
            }


            usort($pages, function($a, $b) { return $a['order'] - $b['order']; });


            foreach($pages as $page) {
                call_user_func_array($page['controller']($app, $user), func_get_args());
            }
        }
    );

    // redirect to settings
    $app->get('/settings/?', function() use ($app) {
        $app->redirect('/account');
    });

    $app->get('/account', function() use ($app) {
        disable_cache($app);

        if (Session::isLoggedIn()) {
            $user = Session::getUser();

            $context = array(
                "user" => $user
            );

            add_header_vars($page, 'account');

            $app->render('account.twig', $page);
        }
    });

    $app->put('/team/:org_id/activate', function($org_id) use ($app) {
        disable_cache($app);
        $user = DatawrapperSession::getUser();
        $orgs = $user->getActiveOrganizations();
        foreach ($orgs as $org) {
            if ($org->getId() == $org_id) {
                $_SESSION['dw-user-organization'] = $org_id;
                print json_encode(array('status' => 'ok'));
                return;
            }
        }
        print json_encode(array(
            'status' => 'error',
            'message'=> __('Organization not found')
        ));
    });

});
