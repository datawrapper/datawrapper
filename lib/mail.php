<?php

/*
 * use this to send email to our users
 */
function dw_send_support_email($to, $subject, $message, $replacements = array()) {
    // auto-replace support email address and domain
    if (empty($replacements['support_email'])) {
        $replacements['support_email'] = $GLOBALS['dw_config']['email']['support'];
    }
    $replacements['domain'] = $GLOBALS['dw_config']['domain'];

    $subject = dw_email_replace($subject, $replacements);
    $message = dw_email_replace($message, $replacements);

    DatawrapperHooks::execute(DatawrapperHooks::SEND_EMAIL,
        $to,
        $subject,
        $message,
        'From: noreply@'.$GLOBALS['dw_config']['domain']. "\r\n" .
        'Reply-To: '.$GLOBALS['dw_config']['email']['support'] . "\r\n" .
        'X-Mailer: PHP/' . phpversion()
    );
}

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

/**
 * Send email an email with attachements 
 * @param $files - array of files to send
 *      ex: array(
 *              "my_image.png" => array(
 *                  "path" => "/home/datawrapper/my_image.png",
 *                  "format" => "image/png"
 *              )
 *          )
 *
 */
function dw_send_mail_attachment($to, $from, $subject, $body, $files) {
    $random_hash = md5(date('r', time()));
       // $random_hash = md5(date('r', time()));
    $random_hash = '-----=' . md5(uniqid(mt_rand())); 

    // headers 
    $headers =  'From: '.$from."\n"; 
    // $headers .= 'Return-Path: <'.$email_reply.'>'."\n"; 
    $headers .= 'MIME-Version: 1.0'."\n"; 
    $headers .= 'Content-Type: multipart/mixed; boundary="'.$random_hash.'"'; 

    // message 
    $message = 'This is a multi-part message in MIME format.'."\n\n"; 

    $message .= '--'.$random_hash."\n"; 
    $message .= 'Content-Type: text/plain; charset="iso-8859-1"'."\n"; 
    $message .= 'Content-Transfer-Encoding: 8bit'."\n\n"; 
    $message .= $body."\n\n"; 

    // attached files
    foreach ($files as $fn => $file) {
        $path   = $file["path"];
        $format = $file["format"];
        $attachment = chunk_split(base64_encode(file_get_contents($path)));
        $message .= '--'.$random_hash."\n"; 
        $message .= 'Content-Type: '. $format .'; name="'. $fn .'"'."\n"; 
        $message .= 'Content-Transfer-Encoding: base64'."\n"; 
        $message .= 'Content-Disposition:attachement; filename="'. $fn . '"'."\n\n"; 
        $message .= $attachment."\n"; 
    }

    DatawrapperHooks::execute(DatawrapperHooks::SEND_EMAIL,
        $to, $subject, $message, $headers
    );
}

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
