<?php

//GET route
$app->get('/account/set-password/:token', function ($token) use ($app) {
    $page = array();
    add_header_vars($page, 'about');
    if (!empty($token)) {
        $users = UserQuery::create()
          ->filterByActivateToken($token)
          ->find();
        $page['salt'] = DW_AUTH_SALT;
        if (count($users) != 1) {
            $page['alert'] = array(
                'type' => 'error',
                'message' => _('This activation token is invalid. Your email address is probably already activated.')
            );
        }
    }
    $app->render('set-password.twig', $page);
});
