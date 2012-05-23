<?php

/*
 * get list of all users
 * @needs admin
 */
$app->get('/users', function() use ($app) {
    $users = UserQuery::create()->find();
    $res = array();
    foreach ($users as $user) {
        $res[] = $user->toArray();
    }
    $app->render('json-ok.php', $res);
});


/*
 * create a new user
 */
$app->post('/users', function() use ($app) {
    $data = json_decode($app->request()->getBody());

    if ($data->pwd === $data->pwd2) {
        $user = new User();
        $user->setCreatedAt(time());
        $user->setEmail($data->email);
        $user->setPwd($data->pwd);
        $user->save();
        $result = $user->toArray();

        $app->render('json-ok.php', array($result));
    } else {
        $app->render('json-error.php', array('code' => 'password-mismatch', 'msg'=> 'Password mismatch'));
    }

});


/*
 * update an existing user
 * @needs admin or existing user
 */
$app->put('/users/:id', function($user_id) use ($app) {
    $data = json_decode($app->request()->getBody());
    $user = new User();
    $user->setCreatedAt(time());
    $user->setEmail($data->email);
    $user->setRole('pending');
    $user->setPwd($data->pwd);
    $user->save();

    $result = $user->toArray();
    unset($result['Pwd']); // never transmit the password to the client

    $app->render('json-ok.php', array($result));
});


/*
 * activate a pending user
 */
$app->get('/activate/:token', function($token) use ($app) {
    $users = UserQuery::create()->find();
});