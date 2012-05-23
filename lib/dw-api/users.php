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
    ok($res);
});

define('DW_TOKEN_SALT', 'aVyyrmc2UpoZGJ3SthaKyGrFzaV3Z37iuFU4x5oLb_aKmhopz5md62UHn25Gf4ti');

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
        $user->setToken(hash_hmac('sha256', $data->email.'/'.$data->pwd, DW_TOKEN_SALT));
        $user->save();
        $result = $user->toArray();

        ok($result);
    } else {
        error('password-mismatch', 'Password mismatch');
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
    ok($result);
});


/*
 * activate a pending user, might be moved to app later
 */
$app->get('/activate/:token', function($token) {
    if (!empty($token)) {
        $users = UserQuery::create()
          ->filterByToken($token)
          ->find();

        if (count($users) == 0) {
            error('token-invalid', 'this token is invalid.');
        } else if (count($users) > 1) {
            error('token-ambiguous', 'this token is ambiguous.');
        } else {
            $user = $users[0];
            $user->setRole('editor');
            $user->setToken('');
            $user->save();
            ok();
        }
    }
});