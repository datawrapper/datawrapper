<?php

/*
 * get list of all users
 * @needs admin
 */
$app->get('/users', function() use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        $users = UserQuery::create()->find();
        $res = array();
        foreach ($users as $user) {
            $res[] = $user->toArray();
        }
        ok($res);
    } else {
        error(403, 'Permission denied');
    }
});

$app->get('/users/:id', function($id) use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        ok(UserQuery::create()->findPK($id)->toArray());
    } else {
        error(403, 'Permission denied');
    }
});

define('DW_TOKEN_SALT', 'aVyyrmc2UpoZGJ3SthaKyGrFzaV3Z37iuFU4x5oLb_aKmhopz5md62UHn25Gf4ti');

require_once('../../lib/utils/check_email.php');

function email_exists($email) {
    $r = UserQuery::create()->findOneByEmail($email);
    return isset($r);
}

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
        'email-already-exists' => function($d) { return !email_exists($d->email); },
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
    $user->setActivateToken(hash_hmac('sha256', $data->email.'/'.$data->pwd.time(), DW_TOKEN_SALT));
    $user->save();
    $result = $user->toArray();

    // send email with activation key
    $name = $data->email;
    $domain = $GLOBALS['dw_config']['domain'];
    $activationLink = 'http://' . $domain . '/account/activate/' . $user->getActivateToken();
    $from = 'activate@' . $domain;

    include('../../lib/templates/activation-email.php');

    mail($data->email, 'Datawrapper Email Activation', $activation_mail, 'From: ' . $from);


    // we don't need to annoy the user with a login form now,
    // so just log in..
    DatawrapperSession::login($user);

    ok($result);

});


/*
 * update user profile
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
            $changed = array();
            $errors = array();

            if (!empty($payload->pwd)) {
                if (!empty($payload->token)) {
                    $chk = $payload->token === $curUser->getResetPasswordToken();
                } else if (!empty($payload->oldpwhash)) {
                    $chk = $hash === $payload->oldpwhash;
                } else {
                    $chk = false;
                }
                // update password
                $hash = hash_hmac('sha256', $user->getPwd(), $payload->time);
                if ($chk || $curUser->isAdmin()) {
                    $user->setPwd($payload->pwd);
                    $curUser->setResetPasswordToken('');
                    $changed[] = 'password';
                } else {
                    $errors[] = 'password-or-token-invalid';
                }
            }

            if (!empty($payload->email)) {
                if (check_email($payload->email)) {
                    if (!email_exists($payload->email)) {
                        $user->setEmail($payload->email);
                        $changed[] = 'email';
                    } else {
                        $errors[] = 'email-already-exists';
                    }
                } else {
                    $errors[] = 'email-is-invalid';
                }
            }

            if (!empty($payload->name)) {
                $user->setName($payload->name);
                $changed[] = 'name';
            }

            if (!empty($payload->website)) {
                $user->setWebsite($payload->website);
                $changed[] = 'website';
            }

            if (!empty($payload->profile)) {
                $user->setSmProfile($payload->profile);
                $changed[] = 'sm_profile';
            }

            if (!empty($changed)) {
                $user->save();
            }

            ok(array('updated' => $changed, 'errors' => $errors));
        } else {
            error('user-not-found', 'no user found with that id');
        }
    } else {
        error('need-login', 'you must be logged in to do that');
    }
});



/*
 * delete a user
 * @needs admin or existing user
 */
$app->delete('/users/:id', function($user_id) use ($app) {
    $curUser = DatawrapperSession::getUser();
    $payload = json_decode($app->request()->getBody());
    if ($curUser->isLoggedIn()) {
        if ($user_id == 'current' || $curUser->getId() === $user_id) {
            $user = $curUser;
        } else if ($curUser->isAdmin()) {
            $user = UserQuery::create()->findPK($user_id);
        }
        if (!empty($user)) {
            if ($user->getPwd() == $payload->pwd) {

                // Delete user
                DatawrapperSession::logout();
                $user->erase();

                ok();
            } else {
                Action::logAction($user, 'delete-request-wrong-password', json_encode(get_user_ips()));
                error('wrong-password', _('The password you entered is not correct.'));
            }
        } else {
            error('user-not-found', 'no user found with that id');
        }
    } else {
        error('need-login', 'you must be logged in to do that');
    }
});
