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
    # check if the user can create a new user
    $currUser = DatawrapperSession::getUser();
    if (!empty($GLOBALS['dw_config']['only_admin_can_create_user_account']) && !$currUser->isAdmin()) {
        return error(403, 'Permission denied');
    }
    $data = json_decode($app->request()->getBody());
    $invitation = empty($data->invitation)? false : (bool) $data->invitation;
    # check values
    $checks = array(
        'email-missing' => function($d) { return trim($d->email) != ''; },
        'email-invalid' => function($d) { return check_email($d->email); },
        'email-already-exists' => function($d) { return !email_exists($d->email); },
    );
    // if invitation is false: classic way, we check passwords
    if (!$invitation) {
        $checks = array_merge($checks, array(
            'password-mismatch' => function($d) { return $d->pwd === $d->pwd2; },
            'password-missing' => function($d) { return trim($d->pwd) != ''; },
        ));
    }
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
    if ($currUser->isAdmin() && !empty($data->role))
        $user->SetRole($data->role);
    $user->setActivateToken(hash_hmac('sha256', $data->email.'/'.time(), DW_TOKEN_SALT));
    // set password, HACK for invitation mode
    if ($invitation) {
        $user->setPwd("__IS_INVITED__");
    } else {
        $user->setPwd($data->pwd);
    }
    $user->save();
    $result = $user->toArray();
    // send an email
    $name   = $data->email;
    $domain = $GLOBALS['dw_config']['domain'];
    $from   = $GLOBALS['dw_config']['email'];
    if ($invitation) {
    // send email with invitation
        $activationLink = 'http://' . $domain . '/account/invitation/' . $user->getActivateToken();
        include('../../lib/templates/invitation-email.php');
        mail($data->email, 'Invitation '. $domain, $invitation_mail, 'From: '.$from);
    } else {
        // send email with activation key
        $activationLink = 'http://' . $domain . '/account/activate/' . $user->getActivateToken();
        include('../../lib/templates/activation-email.php');
        mail($data->email, 'Activation ' . $domain, $activation_mail, 'From: '.$from);
    }

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
                // update password
                $hash = hash_hmac('sha256', $user->getPwd(), $payload->time);
                $chk = false;
                if (!empty($payload->oldpwhash)) {
                    $chk = $hash === $payload->oldpwhash;
                }
                if ($chk || $curUser->isAdmin()) {
                    $user->setPwd($payload->pwd);
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
            if ($curUser->isAdmin() && !empty($payload->role)) {
                $user->setRole($payload->role);
                $changed[] = 'role';
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
    $payload = json_decode($app->request()->getBody());
    $curUser = DatawrapperSession::getUser();
    if ($curUser->isLoggedIn()) {
        if ($user_id == 'current' || $curUser->getId() === $user_id) {
            $user = $curUser;
            if ($user->getPwd() == $payload->pwd) {
                DatawrapperSession::logout();
            } else {
                Action::logAction($user, 'delete-request-wrong-password', json_encode(get_user_ips()));
                error('wrong-password', _('The password you entered is not correct.'));
            }
        } else if ($curUser->isAdmin()) {
            $user = UserQuery::create()->findPK($user_id);
        }
        if (!empty($user)) {
            // Delete user
            $user->erase();
            ok($user);
        } else {
            error('user-not-found', 'no user found with that id');
        }
    } else {
        error('need-login', 'you must be logged in to do that');
    }
});

$app->put('/account/reset-password', function() use ($app) {
    $payload = json_decode($app->request()->getBody());
    if (!empty($payload->token)) {
        $user = UserQuery::create()->getUserByPwdResetToken($payload->token);
        if (!empty($user)) {
            if (!empty($payload->pwd)) {
                // update password
                $hash = hash_hmac('sha256', $user->getPwd(), $payload->time);
                $user->setPwd($payload->pwd);
                $user->setResetPasswordToken('');
                $user->save();
                ok();
            } else {
                error('empty-password', _('The password must not be empty.'));
            }
        } else {
            error('invalid-token', _('The supplied token for password resetting is invalid.'));
        }
    }
});

