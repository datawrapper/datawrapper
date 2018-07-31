<?php

/*
 * replaces %keys% in strings with the provided replacement
 *
 * e.g. dw_email_replace("Hello %name%!", array('name' => $user->getName()))
 */
function dw_email_replace($body, $replacements) {
    foreach ($replacements as $key => $value) {
        $body = str_replace('%'.$key.'%', $value, $body);
    }
    return $body;
}

function send_dw_mail ($to, $subject, $message, $replacements = array()) {
    $config = $GLOBALS['dw_config'];
    // auto-replace support email address and domain
    if (empty($replacements['support_email'])) {
        $replacements['support_email'] = $config['email']['support'];
    }
    $replacements['domain'] = $config['domain'];
    $subject = dw_email_replace($subject, $replacements);
    $message = dw_email_replace($message, $replacements);
    $from    = isset($config['email']['sender']) ? $config['email']['sender'] : ('noreply@'.$config['domain']);

    $headers = 'From: ' . $from . "\r\n" .
        'Reply-To: ' . $config['email']['support'];

    return mail($to, $subject, $message, $headers);
}


/*
 * email when a new user joins datawrapper, to confirm the email address is correct
 */
DatawrapperHooks::register(DatawrapperHooks::SEND_ACTIVATION_EMAIL,
    function ($userEmail, $userName, $activationLink) {
        $body = __("email / activation / body");
        send_dw_mail($userEmail, __('email / activation / subject'), $body,
        array(
            'name' => $userName,
            'activation_link' => $activationLink
        ));
    }
);

/*
 * email when someone wants to reset password
 */
DatawrapperHooks::register(DatawrapperHooks::SEND_RESET_PASSWORD_EMAIL, 
    function ($userEmail, $userName, $passwordResetLink) {

$body = __("email / password-reset / body");

        send_dw_mail($userEmail, __('email / password-reset / subject'), $body,
        array(
            'name' => $userName,
            'password_reset_link' => $passwordResetLink
        ));
    }
);

/*
 * confirmation email when someone requests a change of email address
 */
DatawrapperHooks::register(DatawrapperHooks::SEND_CHANGE_EMAIL_EMAIL,
    function ($userEmail, $userName, $oldEmail, $confirmationLink) {
        $body = __('email / change-email / body');
        send_dw_mail($userEmail, __('email / change-email / subject'), $body,
        array(
            'name' => $userName,
            'email_change_token_link' => $confirmationLink,
            'old_email' => $oldEmail,
            'new_email' => $userEmail
        ));
    }
);

/*
 * classic invite email
 */
DatawrapperHooks::register(DatawrapperHooks::SEND_INVITE_EMAIL_TO_NEW_USER,
    function ($userEmail, $userName, $inviteLink) {
        $body = __("email / invite / body");
        send_dw_mail($userEmail, __('email / invite / subject'), $body,
        array(
            'name' => $userName,
            'invite_link' => $inviteLink
        ));
    }
);

/*
 * invite email to join a team
 */
DatawrapperHooks::register(DatawrapperHooks::SEND_TEAM_INVITE_EMAIL,
    function ($userEmail, $userName, $invitedByName, $teamName, $inviteLink) {
        $body = __("email / team-invite / body");
        send_dw_mail($userEmail, __('email / team-invite / subject'), $body,
        array(
            'name' => $userName,
            'team_name' => $teamName,
            'invited_by' => $invitedByName,
            'invite_link' => $inviteLink
        ));
    }
);

