<?php


DatawrapperHooks::register(DatawrapperHooks::SEND_EMAIL, function($to, $subject, $body, $headers = '') {
    $config = $GLOBALS['dw_config'];

    if (empty($headers)) {
        $from    = isset($config['email']['sender']) ? $config['email']['sender'] : ('noreply@'.$config['domain']);
        $headers = 'From: '.$from;
    }

    return mail($to, $subject, $body, $headers);
});
