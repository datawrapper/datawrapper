<?php

//GET route
$app->get('/account/activate/:token', function ($token) use ($app) {
    disable_cache($app);

    $page = array();
    add_header_vars($page, 'about');
    if (!empty($token)) {
        $users = UserQuery::create()
          ->filterByActivateToken($token)
          ->find();

        if (count($users) != 1) {
            $page['alert'] = array(
                'type' => 'error',
                'message' => 'This activation token is invalid. Your email address is probably already activated.'
            );
        } else {
            $user = $users[0];
            $user->setRole('editor');
            $user->setActivateToken('');
            $user->save();
            $page['alert'] = array(
                'type' => 'success',
                'message' => 'Your email address ' . $user->getEmail() . ' has been successfully activated!'
            );
        }
    }
    $app->render('home.twig', $page);
});

