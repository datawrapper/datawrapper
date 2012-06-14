<?php

//GET route
$app->get('/account/activate/:token', function ($token) use ($app) {
    $page = array();
    add_header_vars($page, 'about');
    if (!empty($token)) {
        $users = UserQuery::create()
          ->filterByToken($token)
          ->find();

        if (count($users) != 1) {
            $page['alert'] = array(
                'type' => 'error',
                'message' => 'This activation token is invalid.'
            );
        } else {
            $user = $users[0];
            $user->setRole('editor');
            $user->setToken('');
            $user->save();
            $page['alert'] = array(
                'type' => 'success',
                'message' => 'You\'re email address ' . $user->getEmail() . ' has been activated!'
            );
        }
    }
    $app->render('home.twig', $page);
});

/*
 * activate a pending user, might be moved to app later
 */
$app->get('/activate/:token', function($token) {

});