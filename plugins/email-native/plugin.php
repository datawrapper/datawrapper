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
        $config = $GLOBALS['dw_config'];

        if (empty($headers)) {
            $headers = 'From: noreply@'.$config['domain'];
            $from    = isset($config['email']['sender']) ? $config['email']['sender'] : ('noreply@'.$config['domain']);
            $headers = 'From: '.$from;
        }

        return mail($to, $subject, $body, $headers);
    }
}
