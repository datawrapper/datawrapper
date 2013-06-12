<?php

/**
 * Datawrapper Email Native
 *
 */

class DatawrapperPlugin_EmailNative extends DatawrapperPlugin {

    public function init() {
        DatawrapperHooks::register(DatawrapperHooks::SEND_EMAIL, array($this, 'sendMail'));
    }

    /**
    * Send an email
    */
    function sendMail($to, $subject, $body, $headers = '') {
        if (empty($headers)) {
            $headers = 'From: '.$GLOBALS['dw_config']['email']['admin'];
        }
        return mail($to, $subject, $body, $headers);
    }
}
