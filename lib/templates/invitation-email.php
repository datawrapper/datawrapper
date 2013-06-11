<?php

/*
 * template for the Datawrapper invitation email
 */


$invitation_mail = sprintf(__('Hello %s,

Your account has just created on Datawrapper.

To choose your password and to activate your account please click on this link.

%s

See you soon'), $name, $activationLink);