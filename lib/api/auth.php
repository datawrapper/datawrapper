<?php

/* get session info */
$app->get('/account', function() {
    try {
        $r = DatawrapperSession::toArray();
        ok($r);
    } catch (Exception $e) {
        error('exception', $e->getMessage());
    }
});

/* set a new language */
$app->put('/account/lang', function() use ($app) {
    $data = json_decode($app->request()->getBody());
    DatawrapperSession::setLanguage( $data->lang );
    ok();
});


/* login user */
$app->post('/auth/login', function() use($app) {
    $payload = json_decode($app->request()->getBody());
    //  v-- don't expire login anymore
    if (true || time() - $payload->time < 3000) {
        $user = UserQuery::create()->findOneByEmail($payload->email);
        if (!empty($user) && $user->getDeleted() == false) {
            $hash = hash_hmac('sha256', $user->getPwd(), $payload->time);
            if ($hash === $payload->pwhash) {
                DatawrapperSession::login($user);
                ok();
            } else {
                Action::logAction($user, 'wrong-password', json_encode(get_user_ips()));
                error('login-invalid', _('The password is incorrect.'));
            }
        } else {
            error('login-email-unknown', _('The email is not registered yet.'));
        }
    } else {
        error('login-expired', _('Your session is expired, please reload the page and try again.'));
    }
});

/* return the server salt for secure auth */
$app->get('/auth/salt', function() use ($app) {
    $salt = 'uRPAqgUJqNuBdW62bmq3CLszRFkvq4RW';
    ok(array('salt' => $salt, 'time' => time()));
});

/*
 *logs out the current user
 */
$app->post('/auth/logout', function() {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        DatawrapperSession::logout();
        ok();
    } else {
        error('not-loggin-in', 'you cannot logout if you\'re not logged in');
    }
});


/*
 * endpoint for sending a new password to a user
 *
 * expects payload { "email": "validemail@domain.tld" }
 */
$app->post('/account/reset-password', function() use($app) {
    $payload = json_decode($app->request()->getBody());
    $user = UserQuery::create()->findOneByEmail($payload->email);
    if (!empty($user)) {

        $curToken = $user->getResetPasswordToken();
        if (!empty($curToken)) {
            error('password-already-reset', _('The password reset email has already been sent. Please contact an <a href="mailto:hello@datawrapper.de">administrator</a>.'));
            return;
        }

        if ($user->getRole() == 'pending') {
            error('account-not-activated', _('You haven\'t activated this email address yet, so we cannot safely send emails to it. Please contact an <a href="mailto:hello@datawrapper.de">administrator</a>.'));
            return;
        }

        $token = hash_hmac('sha256', $user->getEmail().'/'.$user->getPwd().'/'.microtime(), DW_TOKEN_SALT);
        Action::logAction($user, 'reset-password', $token);

        $user->setResetPasswordToken($token);
        $user->save();

        $name = $user->getEmail();
        $passwordResetLink = 'http://' . $GLOBALS['dw_config']['domain'] . '/account/reset-password/' . $token;
        $from = 'password-reset@' . $GLOBALS['dw_config']['domain'];
        include('../../lib/templates/password-reset-email.php');
        mail($user->getEmail(), 'Datawrapper Password Reset', $password_reset_mail, 'From: ' . $from);
        ok(_('You should soon receive an email with further instructions.'));

    } else {
        error('login-email-unknown', _('The email is not registered yet.'));
    }
});


/*
 * endpoint for re-sending the activation link to a user
 */
$app->post('/account/resend-activation', function() use($app) {
    $user = DatawrapperSession::getUser();
    $token = $user->getActivateToken();
    if (!empty($token)) {
        // check how often the activation email has been send
        // we don't want to send it too often in order to prevent
        // mail spam coming from our server
        $r = ActionQuery::create()->filterByUser($user)
            ->filterByKey('resend-activation')
            ->find();
        if (count($r) > 2) {
            error('avoid-spam', str_replace('%ADMINEMAIL%', $GLOBALS['dw_config']['admin_email'], _('You already resent the activation mail three times, now. Please <a href="mailto:%ADMINEMAIL%">contact an administrator</a> to proceed with your account activation.')));
            return false;
        }

        // remember that we send the email
        Action::logAction($user, 'resend-activation', $token);

        // send email with activation key
        $name = $user->getEmail();
        $domain = $GLOBALS['dw_config']['domain'];
        $activationLink = 'http://' . $domain . '/account/activate/' . $token;
        $from = 'activate@' . $domain;

        include('../../lib/templates/activation-email.php');

        mail($user->getEmail(), 'Datawrapper Email Activation', $activation_mail, 'From: ' . $from);

        ok(_('The activation email has been send to your email address, again.'));

    } else {
        error('token-empty', _('You\'re account is probably already activated.'));
    }
});