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
        $app->redirect('/settings/' . $pages[0]['url']);
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
        $app->get('/settings/' . $page['url'] . '/?', $page['controller']($app, $context));
    }

});

