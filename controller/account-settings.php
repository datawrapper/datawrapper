<?php

//GET route
$app->get('/account/settings', function () use ($app) {
    disable_cache($app);

    $page = array('title' => 'Datawrapper');
    add_header_vars($page, 'user');

    $user = DatawrapperSession::getUser();

    if ($user->getRole() == 'guest') {
        error_settings_need_login();
        return;
    }

    if ($user->getRole() == 'pending') {
        $t = ActionQuery::create()
            ->filterByUser($user)
            ->filterByKey('resend-activation')
            ->orderByActionTime('desc')
            ->findOne();
        if (empty($t)) {
            $t = $user->getCreatedAt('U');
        } else {
            $t = $t->getActionTime('U');
        }
        $page['activation_email_date'] = strftime('%x', $t);
    }

    $app->render('settings.twig', $page);
});