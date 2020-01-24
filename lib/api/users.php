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
