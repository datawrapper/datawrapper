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

DatawrapperHooks::register(DatawrapperHooks::SEND_ACTIVATION_EMAIL,
    function ($userEmail, $userName, $activationLink) {
        $body = __("email / activation");
        send_dw_mail($userEmail, __('Datawrapper: Please activate your email address'), $body,
        array(
            'name' => $userName,
            'activation_link' => $activationLink
        ));
    }
);

DatawrapperHooks::register(DatawrapperHooks::SEND_TEAM_INVITE_EMAIL,
    function ($userEmail, $userName, $teamName, $activationLink) {

    }
);

DatawrapperHooks::register(DatawrapperHooks::SEND_TEAM_INVITE_EMAIL_TO_NEW_USER,
    function ($userEmail, $userName, $teamName, $activationLink) {

    }
);

DatawrapperHooks::register(DatawrapperHooks::SEND_RESET_PASSWORD_EMAIL, 
    function ($userEmail, $userName, $passwordResetLink) {

$body = __("
Hello %name%,
Someone, probably you, filed a request to reset your password.
If that's true, please click the following link to reset your password.
%password_reset_link%
If you ignore this email, your password stays the same as before.
Best,
Datawrapper
");

        send_dw_mail($userEmail, __('Datawrapper: You requested a reset of your password'), $body,
        array(
            'name' => $userName,
            'password_reset_link' => $passwordResetLink
        ));
    }
);

DatawrapperHooks::register(DatawrapperHooks::SEND_CHANGE_EMAIL_EMAIL,
    function ($userEmail, $userName, $oldEmail, $confirmationLink) {
        $body = __("email / change-email");
        send_dw_mail($userEmail, __('Datawrapper: You requested a change of your email address'), $body,
        array(
            'name' => $userName,
            'email_change_token_link' => $confirmationLink,
            'old_email' => $oldEmail,
            'new_email' => $userEmail
        ));
    }
);
