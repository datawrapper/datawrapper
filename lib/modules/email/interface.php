<?php

interface IDatawrapper_Email {

    // sends out a mail
    function sendMail($recipient, $subject, $body);

}