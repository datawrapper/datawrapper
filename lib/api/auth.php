<?php

/* login user */
$app->post('/auth/login', function() use($app) {
    $payload = json_decode($app->request()->getBody());
    if (time() - $payload->time < 300) {
        $user = UserQuery::create()->findOneByEmail($payload->email);
        if (!empty($user)) {
            $hash = hash_hmac('sha256', $user->getPwd(), $payload->time);
            if ($hash === $payload->pwhash) {
                ok();
                DatawrapperSession::login($user);
            } else {
                error('login-invalid', 'Either the password is incorrect or your login has expired.');
            }
        } else {
            error('login-email-unknown', 'The email is not registered yet.');
        }
    } else {
        error('login-expired', 'Your session is expired, please reload the page and try again.');
    }
});

/* return the server salt for secure auth */
$app->get('/auth/salt', function() use ($app) {
    $salt = 'uRPAqgUJqNuBdW62bmq3CLszRFkvq4RW';
    ok(array('salt' => $salt, 'time' => time()));
});

/* logout */
$app->post('/auth/logout', function() {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        DatawrapperSession::logout();
        ok();
    } else {
        error('not-loggin-in', 'you cannot logout if you\'re not logged in');
    }
});