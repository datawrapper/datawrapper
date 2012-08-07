<?php

//GET route
$app->get('/account/settings', function () use ($app) {
    $page = array('title' => 'Datawrapper');
    add_header_vars($page, 'user');

    $user = DatawrapperSession::getUser();
    if ($user->getRole() == 'pending') {
        $t = ActionQuery::create()
            ->filterByUser($user)
            ->filterByKey('resend-activation')
            ->orderByActionTime('desc')
            ->findOne();
        if (empty($t)) {
            $t = $user->getCreatedAt('U');
        } else {
            $t1 = $t->getActionTime('U');
        }
        $page['activation_email_date'] = strftime('%x', $t);
    }

    $app->render('settings.twig', $page);
});