<?php

class Datawrapper_Email_Native implements IDatawrapper_Email {

    function sendMail($to, $subject, $body) {
        mail($to, $subject, $body);
    }

}