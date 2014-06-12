<?php

//GET route
$app->get('/account/reset-password/:token', function ($token) use ($app) {
    disable_cache($app);

    $page = array();
    add_header_vars($page, 'account');
    if (!empty($token)) {
        $users = UserQuery::create()
          ->filterByResetPasswordToken($token)
          ->find();

        if (count($users) != 1) {
            $page['alert'] = array(
                'type' => 'error',
                'message' => 'This activation token is invalid.'
            );

            error_invalid_password_reset_token();

        } else {
            $user = $users[0];
            // $user->setResetPasswordToken('');
            // $user->save();
            $page['token'] = $token;

            $app->render('account/reset-password.twig', $page);
        }
    }
});

