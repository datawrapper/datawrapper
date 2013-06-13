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

function dw_send_mail_attachment($to, $from, $subject, $message, $files) {
    $random_hash = md5(date('r', time()));
    $headers = "From: $from";
    $headers .= "\r\nContent-Type: multipart/mixed; boundary=\"PHP-mixed-".$random_hash."\"";

    $mbody = "\n--PHP-mixed-$random_hash";
    $mbody .= "\r\nContent-Type: multipart/alternative; boundary=\"PHP-alt-$random_hash\"";
    $mbody .= "\r\n\r\n--PHP-alt-$random_hash";
    $mbody .= "\r\nContent-Type: text/plain; charset=\"iso-8859-1\"";
    $mbody .= "\r\nContent-Transfer-Encoding: 7bit";
    $mbody .= "\r\n\r\n" . $message;
    $mbody .= "\r\n\r\n--PHP-alt-$random_hash";

    foreach ($files as $fn => $outfile) {
        $attachment = chunk_split(base64_encode(file_get_contents($outfile)));
        $mbody .= "\r\n\r\n--PHP-mixed-$random_hash";
        $mbody .= "\r\nContent-Type: image/$format; name=\"$fn\"";
        $mbody .= "\r\nContent-Transfer-Encoding: base64";
        $mbody .= "\r\nContent-Disposition: attachment";
        $mbody .= "\r\n\r\n" . $attachment;
    }

    $mbody .= "\r\n--PHP-mixed-$random_hash\r\n";

    DatawrapperHooks::execute(DatawrapperHooks::SEND_EMAIL,
        $to, $subject, $message, $headers
    );
}