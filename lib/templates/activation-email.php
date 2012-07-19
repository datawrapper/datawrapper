<?php

/*
 * template for the Datawrapper activation email
 */

$activation_mail = <<<MAIL

Hello $name,

Thank you for signing up at Datawrapper on $domain!

Please click on this link to activate your email address.

$activationLink

Cheers!
MAIL;
