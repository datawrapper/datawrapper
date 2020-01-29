<?php

/*
 * get list of all users
 * @needs admin
 */
$app->get('/users', function() use ($app) {
    $user = Session::getUser();
    if ($user->isAdmin()) {
        $userQuery = UserQuery::create()->filterByDeleted(false);
        if ($app->request()->get('email')) {
            $userQuery->filterByEmail($app->request()->get('email'));
        }
        $users = $userQuery->limit(100)->find();
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
    $user = Session::getUser();
    if ($user->isAdmin()) {
        ok(UserQuery::create()->findPK($id)->toArray());
    } else {
        error(403, 'Permission denied');
    }
});

define('DW_TOKEN_SALT', 'aVyyrmc2UpoZGJ3SthaKyGrFzaV3Z37iuFU4x5oLb_aKmhopz5md62UHn25Gf4ti');

function email_exists($email) {
    $r = UserQuery::create()->findOneByEmail($email);
    return isset($r);
}

/*
 * create a new user
 */
$app->post('/users', function() use ($app) {
    $data = json_decode($app->request()->getBody());
    $currUser = Session::getUser();
    $invitation = empty($data->invitation)? false : (bool) $data->invitation;
    $chartId = empty($data->chartId)? false : $data->chartId;

    // check values
    if (trim($data->email) === '') {
        $app->response()->status(400);
        return error('email-missing', 'The email address must not be empty');
    }
    if (!check_email($data->email)) {
        $app->response()->status(400);
        return error('email-invalid', 'The email address is invalid');
    }
    if (email_exists($data->email)) {
        $app->response()->status(403);
        return error('email-already-exists', 'The email address is already registered.');
    }

    // if invitation is false: classic way, we check passwords
    if (!$invitation) {
        if ($data->pwd !== $data->pwd2) {
            $app->response()->status(400);
            return error('password-mismatch', 'The passwords must be identical');
        }
        if (trim($data->pwd) === '') {
            $app->response()->status(400);
            return error('password-missing', 'The password must not be empty');
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
    $user->setLanguage(Session::getLanguage());
    $user->setActivateToken(hash_hmac('sha256', $data->email.'/'.time(), DW_TOKEN_SALT));
    $user->save();
    $result = $user->serialize();

    Hooks::execute(Hooks::USER_SIGNUP, $user);

    // send an email
    $name     = $data->email;
    $domain   = $GLOBALS['dw_config']['domain'];
    $protocol = get_current_protocol();

    if ($invitation) {
        // send invitation
        $invitationLink = $protocol . '://' . $domain . '/account/invite/' . $user->getActivateToken() . ($chartId ? ('?chart=' . $chartId) : '');
        Hooks::execute(Hooks::SEND_INVITE_EMAIL_TO_NEW_USER,
            $data->email, $user->guessName(), $invitationLink);
    } else {
        // send account activation link
        $activationLink = $protocol . '://' . $domain . '/account/activate/' . $user->getActivateToken();
        Hooks::execute(Hooks::SEND_ACTIVATION_EMAIL, $data->email, $data->email, $activationLink);
    }

    // we don't need to annoy the user with a login form now,
    // so just log in..
    Session::login($user);

    ok($result);
});


/*
 * update user profile
 * @needs admin or existing user
 */
$app->put('/users/:id', function($user_id) use ($app) {
    $payload = json_decode($app->request()->getBody());
    $curUser = Session::getUser();

    if ($curUser->isLoggedIn()) {
        if ($user_id == 'current' || $curUser->getId() === intval($user_id)) {
            $user = $curUser;
        } else if ($curUser->isAdmin()) {
            $user = UserQuery::create()->findPK($user_id);
        }

        if (!empty($user)) {
            $messages = array();
            $errors = array();

            if (!empty($payload->pwd)) {
                // update password
                $chk = false;
                if (!empty($payload->oldpwhash)) {
                    $chk = $user->getPwd() === secure_password($payload->oldpwhash);
                }
                if ($chk || $curUser->isSysAdmin()) {
                    $user->setPwd($payload->pwd);
                    Action::logAction($curUser, 'change-password', array('user' => $user->getId()));
                } else {
                    Action::logAction($curUser, 'change-password-failed', array('user' => $user->getId(), 'reason' => 'old password is wrong'));
                    $errors[] = __('The password could not be changed because your old password was not entered correctly.');
                }
            }

            if (!empty($payload->email) && $payload->email != $user->getEmail()) {
                if (check_email($payload->email) || $curUser->isAdmin()) {
                    if (!email_exists($payload->email)) {
                        if ($curUser->isAdmin()) {
                            $user->setEmail($payload->email);
                        } else {
                            // non-admins need to confirm new emails addresses
                            $token = hash_hmac('sha256', $user->getEmail().'/'.$payload->email.'/'.time(), DW_TOKEN_SALT);
                            $token_link = get_current_protocol() . '://' . $GLOBALS['dw_config']['domain'] . '/account/profile?token='.$token;

                            Hooks::execute(Hooks::SEND_CHANGE_EMAIL_EMAIL,
                                $payload->email, $user->guessName(), $user->getEmail(), $token_link);

                            // log action for later confirmation
                            Action::logAction($curUser, 'email-change-request', array(
                                'old-email' => $user->getEmail(),
                                'new-email' => $payload->email,
                                'token' => $token
                            ));
                            $messages[] = __('To complete the change of your email address, you need to confirm that you have access to it. Therefor we sent an email with the confirmation link to your new address. Your new email will be set right after you clicked that link.');
                        }
                    } else {
                        $errors[] = sprintf(__('The email address <b>%s</b> already exists.'), $payload->email);
                    }
                } else {
                    $errors[] = sprintf(__('The email address <b>%s</b> is invalid.'), $payload->email);
                }
            }

            if (!empty($payload->name)) {
                $user->setName($payload->name);

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

                if ($payload->role != "pending") {
                    $user->setActivateToken("");
                }
            }

            if (!empty($payload->website)) {
                $user->setWebsite($payload->website);
            }

            if (!empty($payload->profile)) {
                $user->setSmProfile($payload->profile);
            }

            if ($user->isModified()) {
                $user->save();
                $messages[] = __('This just worked fine. Your profile has been updated.');
            }

            ok(array('messages' => $messages, 'errors' => $errors));
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
    $curUser = Session::getUser();
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
        if ($user_id == 'current' || $curUser->getId() == $user_id) {
            $user = $curUser;
        } else if ($curUser->isAdmin()) {
            $user = UserQuery::create()->findPK($user_id);
            $pwd = $user->getPwd();
        }
        if (!empty($user)) {
            if ($user->getPwd() === secure_password($pwd)) {

                // Delete user
                if (!$curUser->isAdmin()) {
                    Session::logout();
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

$app->post('/user/:id/products', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$user = UserQuery::create()->findPk($id);
		if ($user) {
			$data = json_decode($app->request()->getBody(), true);
			foreach ($data as $p_id => $expires) {
				$product = ProductQuery::create()->findPk($p_id);
				if ($product) {
					$up = new UserProduct();
					$up->setProduct($product);

					if ($expires) {
						$up->setExpires($expires);
					}

					$user->addUserProduct($up);
				}
			}
			$user->save();
			ok();
		} else {
			 error('user-not-found', 'no user found with that id');
		}
	});
});

$app->get('/user/data/:key', function($key) use ($app) {
    $user = Session::getUser();
    if ($user->isLoggedIn()) {
        $userData = $user->getUserData();
        ok($userData[$key] ?? null);
        return;
    }
    error('not-logged-in', 'you need to be logged in to access user data');
});

$app->post('/user/data', function() use ($app) {
    $user = Session::getUser();
    if ($user->isLoggedIn()) {
        $data = json_decode($app->request()->getBody(), true);
        $userData = $user->getUserData();
        foreach ($data as $key => $value) {
            $userData[$key] = $value;
        }
        $user->setUserData($userData);
    }
    ok();
});
