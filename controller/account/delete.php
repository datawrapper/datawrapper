<?php

DatawrapperHooks::register(DatawrapperHooks::GET_ACCOUNT_PAGES, function() {
    return array(
        'title' => __('Delete account'),
        'order' => 9999,
        'icon' => 'fa-frown-o',
        'url' => 'delete',
        'controller' => function($app, $context) {
            return function() use ($app, $context) {
                disable_cache($app);
                $user = $context['user'];
                if ($user->getRole() == 'guest') {
                    error_settings_need_login();
                    return;
                }

                $app->render('account/delete.twig', $context);
            };
        }
    );
});
