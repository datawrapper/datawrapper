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

require_once('utils/validEmail.php');

/*
 * create a new user
 */
$app->post('/users', function() use ($app) {
    $data = json_decode($app->request()->getBody());

    $checks = array(
        'password-mismatch' => function($d) { return $d->pwd === $d->pwd2; },
        'password-missing' => function($d) { return trim($d->pwd) != ''; },
        'email-missing' => function($d) { return trim($d->email) != ''; },
        'email-invalid' => function($d) { return validEmail($d->email); },
    );

    foreach ($checks as $code => $check) {
        if (call_user_func($check, $data) == false) {
            error($code, $code);
            return;
        };
    }

    // all checks passed
    $user = new User();
    $user->setCreatedAt(time());
    $user->setEmail($data->email);
    $user->setPwd($data->pwd);
    $user->setToken(hash_hmac('sha256', $data->email.'/'.$data->pwd, DW_TOKEN_SALT));
    $user->save();
    $result = $user->toArray();

    ok($result);
});


/*
 * set a new password
 * @needs admin or existing user
 */
$app->put('/users/:id', function($user_id) use ($app) {
    $payload = json_decode($app->request()->getBody());
    $curUser = DatawrapperSession::getUser();
    if ($curUser->isLoggedIn()) {
        if ($user_id == 'current' || $curUser->getId() === $user_id) {
            $user = $curUser;
        } else if ($curUser->isAdmin()) {
            $user = UserQuery::create()->findPK($user_id);
        }
        if (!empty($user)) {
            $hash = hash_hmac('sha256', $user->getPwd(), $payload->time);
            if ($hash === $payload->oldpwhash || $curUser->isAdmin()) {
                $user->setPwd($payload->pwd);
                $user->save();
                ok();
            }
        } else {
            error('user-not-found', 'no user found with that id');
        }
    } else {
        error('need-login', 'you must be logged in to do that');
    }
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