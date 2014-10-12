<?php


DatawrapperHooks::register(DatawrapperHooks::SEND_EMAIL, function($to, $subject, $body, $headers = '') {
    if (empty($headers)) {
        $headers = 'From: noreply@'.$GLOBALS['dw_config']['domain'];
    }
    return mail($to, $subject, $body, $headers);
});