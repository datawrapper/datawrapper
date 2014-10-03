<?php

require_once ROOT_PATH . 'controller/settings/profile.php';
require_once ROOT_PATH . 'controller/settings/delete.php';
require_once ROOT_PATH . 'controller/settings/password.php';


call_user_func(function() {

    global $app;

    $user = DatawrapperSession::getUser();
    $pages = DatawrapperHooks::execute(DatawrapperHooks::GET_SETTINGS_PAGES, $user);

    foreach ($pages as $page) {
        if (!isset($page['order'])) $page['order'] = 999;
    }

    usort($pages, function($a, $b) { return $a['order'] - $b['order']; });

    $app->get('/settings/?', function() use ($app, $pages) {
        $app->redirect('/settings/' . $pages[0]['url'] . '/');
    });
    // redirect to settings
    $app->get('/account/?', function() use ($app) {
        $app->redirect('/settings');
    });

    $user = DatawrapperSession::getUser();

    foreach ($pages as $page) {
        $context = array(
            'title' => $page['title'],
            'gravatar' => md5(strtolower(trim($user->getEmail()))),
            'pages' => $pages,
            'active' => $page['url'],
            'user' => $user
        );
        add_header_vars($context, 'settings');
        $app->get('/settings/' . $page['url'] . '/?', function() use ($app, $context, $page) {
            $u = DatawrapperSession::getUser();
            if ($u->isSysAdmin()) {
                if ($app->request()->get('uid') != null) {
                    $u = UserQuery::create()->findPk($app->request()->get('uid'));
                    if ($u) {
                        $context['user'] = $u;
                        $context['notme'] = $u != DatawrapperSession::getUser();
                        $context['gravatar'] = md5(strtolower(trim($u->getEmail())));
                        // update links to other pages
                        for ($i = 0; $i < count($context['pages']); $i++) {
                            $context['pages'][$i]['params'] = '?uid='.$u->getId();
                        }
                    }
                }
            }
            call_user_func_array($page['controller']($app, $context), func_get_args());
        });
    }

});

