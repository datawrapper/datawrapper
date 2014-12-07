<?php

require_once ROOT_PATH . 'controller/account/activate.php';
require_once ROOT_PATH . 'controller/account/set-password.php';
require_once ROOT_PATH . 'controller/account/reset-password.php';
require_once ROOT_PATH . 'controller/account/profile.php';
require_once ROOT_PATH . 'controller/account/delete.php';
require_once ROOT_PATH . 'controller/account/password.php';
require_once ROOT_PATH . 'controller/account/mycharts.php';


call_user_func(function() {

    global $app;

    $user = DatawrapperSession::getUser();
    $pages = DatawrapperHooks::execute(DatawrapperHooks::GET_ACCOUNT_PAGES, $user);

    foreach ($pages as $page) {
        if (!isset($page['order'])) $page['order'] = 999;
    }

    usort($pages, function($a, $b) { return $a['order'] - $b['order']; });

    $app->get('/account/?', function() use ($app, $pages) {
        $app->redirect('/account/' . $pages[0]['url'] . '/');
    });
    // redirect to settings
    $app->get('/settings/?', function() use ($app) {
        $app->redirect('/account');
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
        add_header_vars($context, 'account');
        $app->get('/account/' . $page['url'] . '/?', function() use ($app, $context, $page) {
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
