<?php

/* get session info */
$app->get('/account', function() {
    try {
        $r = Session::toArray();
        ok($r);
    } catch (Exception $e) {
        error('exception', $e->getMessage());
    }
});

/* get current language */
$app->get('/account/lang', function() use ($app) {
    ok(Session::getLanguage());
});

/* set a new language */
$app->put('/account/lang', function() use ($app) {
    $data = json_decode($app->request()->getBody());
    Session::setLanguage( $data->lang );
    ok();
});


/*
 * endpoint for re-sending the activation link to a user
 */
$app->post('/account/resend-activation', function() use($app) {
    $user = Session::getUser();
    $token = $user->getActivateToken();
    if (!empty($token)) {
        // check how often the activation email has been send
        // we don't want to send it too often in order to prevent
        // mail spam coming from our server
        $r = ActionQuery::create()->filterByUser($user)
            ->filterByKey('resend-activation')
            ->find();
        if (count($r) > 2) {
            error('avoid-spam', str_replace('%support_email%', $GLOBALS['dw_config']['email']['support'], __('You already resent the activation mail three times, now. Please <a href="mailto:%support_email%">contact an administrator</a> to proceed with your account activation.')));
            return false;
        }

        // remember that we send the email
        Action::logAction($user, 'resend-activation', $token);

        // send email with activation key
        $domain   = $GLOBALS['dw_config']['domain'];
        $protocol = get_current_protocol();
        $activationLink = $protocol . '://' . $domain . '/account/activate/' . $token;

        Hooks::execute(Hooks::SEND_ACTIVATION_EMAIL, $user->getEmail(),
          $user->guessName(), $activationLink);

        ok(__('The activation email has been send to your email address, again.'));

    } else {
        error('token-empty', __('You\'re account is probably already activated.'));
    }
});

/*
 * endpoint for sending a new invitation to a user
 *
 * expects payload { "email": "validemail@domain.tld" }
 */
$app->post('/account/resend-invitation', function() use($app) {
    $payload = json_decode($app->request()->getBody());
    $user    = UserQuery::create()->findOneByEmail($payload->email);
    $token   = $user->getActivateToken();
    if (!empty($user)) {
        if (empty($token)) {
            return error("token-invalid", __("This activation token is invalid. Your email address is probably already activated."));
        }
        // variables for `templates/invitation-email.php`
        $domain         = $GLOBALS['dw_config']['domain'];
        $protocol       = get_current_protocol();
        $invitationLink = $protocol . '://' . $domain . '/account/invite/' . $token;
        $name           = $user->getEmail();

        Hooks::execute(Hooks::SEND_INVITE_EMAIL_TO_NEW_USER,
            $user->getEmail(), $user->guessName(), $invitationLink);
        ok(__('You should soon receive an email with further instructions.'));
    } else {
        error('login-email-unknown', __('The email is not registered yet.'));
    }
});

/*
 * endpoint for validating an invitation. The user sends his new password
 */
$app->post('/account/invitation/:token', function ($token) use ($app) {
    $data = json_decode($app->request()->getBody());
    if (!empty($token)) {
        $users = UserQuery::create()
          ->filterByActivateToken($token)
          ->find();
        if (count($users) != 1) {
            error("token-invalid", __("This activation token is invalid. Your email address is probably already activated."));
        } elseif (empty($data->pwd1)) {
            error("password-missing", __("You must enter a password."));
        } elseif ($data->pwd1 != $data->pwd2) {
            error("password-mismatch", __("Both passwords must be the same."));
        } else {
            $user = $users[0];
            $user->setActivateToken('');
            $user->setPwd($data->pwd1);
            $user->setRole(UserPeer::ROLE_EDITOR);
            $user->save();
            // NOTE: we don't need a confirmation.
            # send confirmation email
            // $name   = $user->getEmail();
            // $domain = $GLOBALS['dw_config']['domain'];
            // $from   = $GLOBALS['dw_config']['email'];
            // $link = 'http://' . $domain;
            // include('../../lib/templates/confirmation-email.php');
            // mail($name, __('Confirmation of account creation') . ' ' . $domain, $confirmation_email, 'From: ' . $from);
            Session::login($user);
            ok();
        }
    }
});

/*
 * return a list of any available alternative signin methods
 */
$app->get('/auth/alternative-signins', function () use ($app) {
    ok(Hooks::execute(Hooks::ALTERNATIVE_SIGNIN));
});
