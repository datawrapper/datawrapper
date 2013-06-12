<?php

/*
 * get list of all users
 * @needs admin
 */
$app->get('/users', function() use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        $users = UserQuery::create()->filterByDeleted(false)->find();
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
    $currUser = DatawrapperSession::getUser();
    $invitation = empty($data->invitation)? false : (bool) $data->invitation;
    // check values
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
        }
    }

    // all checks passed
    $user = new User();
    $user->setCreatedAt(time());
    $user->setEmail($data->email);

    if (!$invitation) {
        $user->setPwd($data->pwd);
    }
    if ($currUser->isAdmin() && !empty($data->role)) {
        // Only sysadmin can set a sysadmin role
        if ($data->role == "sysadmin"){
            if (!$currUser->isSysAdmin()) {
                error(403, 'Permission denied');
                return;
            }
        }
        $user->SetRole($data->role);
    }
    $user->setLanguage(DatawrapperSession::getLanguage());
    $user->setActivateToken(hash_hmac('sha256', $data->email.'/'.time(), DW_TOKEN_SALT));
    $user->save();
    $result = $user->toArray();

    // send an email
    $name   = $data->email;
    $domain = $GLOBALS['dw_config']['domain'];

    if ($invitation) {
        $invitationLink = 'http://' . $domain . '/account/invite/' . $user->getActivateToken();
        $from = $GLOBALS['dw_config']['email']['invite'];
        include(ROOT_PATH . 'lib/templates/invitation-email.php');
        DatawrapperHooks::execute(
            DatawrapperHooks::SEND_EMAIL,
            $data->email, sprintf(__('You have been invited to %s'), $domain), $invitation_mail, 'From: ' . $from
        );
    } else {
        $activationLink = 'http://' . $domain . '/account/activate/' . $user->getActivateToken();
        $from = $GLOBALS['dw_config']['email']['activate'];
        include(ROOT_PATH . 'lib/templates/activation-email.php');
        DatawrapperHooks::execute(
            DatawrapperHooks::SEND_EMAIL,
            $data->email, __('Datawrapper Email Activation'), $activation_mail, 'From: ' . $from
        );

        // we don't need to annoy the user with a login form now,
        // so just log in..
        DatawrapperSession::login($user);
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

            if (!empty($payload->pwd)) {;
                // update password
                $chk = false;
                if (!empty($payload->oldpwhash)) {
                    $chk = $user->getPwd() === secure_password($payload->oldpwhash);
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
                // Only sysadmin can set a sysadmin role
                if ($payload->role == "sysadmin"){
                    if (!$curUser->isSysAdmin()) {
                        error(403, 'Permission denied');
                        return;
                    }
                }
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
    $curUser = DatawrapperSession::getUser();
    $payload = json_decode($app->request()->getBody());
    if (!isset($payload->pwd)) {
        $pwd = $app->request()->get('pwd');
        if (empty($pwd)) {
            error('no-password', 'no password was provided with the delete request');
            return;
        }
    } else {
        $pwd = $payload->pwd;
    }
    if ($curUser->isLoggedIn()) {
        if ($user_id == 'current' || $curUser->getId() === $user_id) {
            $user = $curUser;
        } else if ($curUser->isAdmin()) {
            $user = UserQuery::create()->findPK($user_id);
            $pwd = $user->getPwd();
        }
        if (!empty($user)) {
            if ($user->getPwd() == $pwd) {

                // Delete user
                if (!$curUser->isAdmin()) {
                    DatawrapperSession::logout();
                }
                $user->erase();

                ok();
            } else {
                Action::logAction($user, 'delete-request-wrong-password', json_encode(get_user_ips()));
                error('wrong-password', __('The password you entered is not correct.'));
            }
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
                $user->setPwd($payload->pwd);
                $user->setResetPasswordToken('');
                $user->setActivateToken('');
                $user->save();
                ok();
            } else {
                error('empty-password', __('The password must not be empty.'));
            }
        } else {
            error('invalid-token', __('The supplied token for password resetting is invalid.'));
        }
    }
});

