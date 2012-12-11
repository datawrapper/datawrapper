<?php

/*
 * template for the Datawrapper activation email
 */

$activation_mail = sprintf(_('Hello %s,

Thank you for signing up at Datawrapper on %s!

Please click on this link to activate your email address.

%s

Cheers!'), $name, $domain, $activationLink);