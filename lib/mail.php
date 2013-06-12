<?php

/*
 * send error message
 */
function dw_send_error_mail($subject, $message) {
    $to = $GLOBALS['dw_config']['email']['log'];
    $from = $GLOBALS['dw_config']['email']['error'];
    DatawrapperHooks::execute(DatawrapperHooks::SEND_EMAIL,
        $to, $subject, $message, 'From: '.$from
    );
}
