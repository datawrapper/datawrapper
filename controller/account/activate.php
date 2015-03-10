<?php

//GET route
$app->get('/account/activate/:token', function ($token) use ($app) {
    disable_cache($app);

    $page = array();
    add_header_vars($page, 'about');
    $params = '';
    if (!empty($token)) {
        $users = UserQuery::create()
          ->filterByActivateToken($token)
          ->find();

        if (count($users) != 1) {
            $params = '?t=e&m='.urlencode(__('This activation token is invalid. Your email address is probably already activated.'));
        } else {
            $user = $users[0];
            $user->setRole('editor');
            $user->setActivateToken('');
            $user->save();
            // notify plugins about the newly activated user
            DatawrapperHooks::execute(DatawrapperHooks::USER_ACTIVATED, $user);
            $params = '?t=s&m='.urlencode(sprintf(__('Your email address %s has been successfully activated!'), $user->getEmail()));
        }
    }
    $app->redirect('/'.$params);
});


/*
 * check invitation token and show invited page
 */
$app->get('/account/invite/:token', function($token) use ($app) {
    disable_cache($app);
    _checkInviteTokenAndExec($token, function($user) use ($app) {
        $page = array(
            'email' => $user->getEmail(),
            'auth_salt' => DW_AUTH_SALT
        );
        add_header_vars($page, 'about', 'account/invite.css');
        $app->render('account/invite.twig', $page);
    });
});

/*
 * store new password, clear invitation token and login
 */
$app->post('/account/invite/:token', function($token) use ($app) {
    _checkInviteTokenAndExec($token, function($user) use ($app) {
        $data = json_decode($app->request()->getBody());
        $user->setPwd($data->pwd);
        $user->setActivateToken('');
        $user->save();
        // notify plugins about the newly activated user
        DatawrapperHooks::execute(DatawrapperHooks::USER_ACTIVATED, $user);
        DatawrapperSession::login($user);
        print json_encode(array('result' => 'ok'));
    });
});

function _checkInviteTokenAndExec($token, $func) {
    if (!empty($token)) {
        $user = UserQuery::create()->findOneByActivateToken($token);
        if ($user && $user->getRole() != 'pending') {
            $func($user);
        } else {
            // this is not a valid token!
            $page['alert'] = array(
                'type' => 'error',
                'message' => __('The invitation token is invalid.')
            );
            global $app;
            $app->redirect('/');
        }
    }
}