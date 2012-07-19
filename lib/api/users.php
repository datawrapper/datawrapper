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

require_once('../../lib/utils/check_email.php');

/*
 * create a new user
 */
$app->post('/users', function() use ($app) {
    $data = json_decode($app->request()->getBody());

    $checks = array(
        'password-mismatch' => function($d) { return $d->pwd === $d->pwd2; },
        'password-missing' => function($d) { return trim($d->pwd) != ''; },
        'email-missing' => function($d) { return trim($d->email) != ''; },
        'email-invalid' => function($d) { return check_email($d->email); },
        'email-already-exists' => function($d) { $r = UserQuery::create()->findOneByEmail($d->email); return !isset($r); },
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

    // send email with activation key
    $name = $data->email;
    $domain = DW_DOMAIN;
    $activationLink = 'http://' . $domain . '/account/activate/' . $user->getToken();
    $from = 'activate@' . $domain;

    include('../../lib/templates/activation-email.php');

    mail($data->email, 'Datawrapper Email Activation', $activation_mail, 'From: ' . $from);


    // we don't need to annoy the user with a login form now,
    // so just log in..
    DatawrapperSession::login($user);

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

