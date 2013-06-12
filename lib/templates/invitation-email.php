<?php

/*
 * template for the Datawrapper invitation email
 */


$invitation_mail = sprintf(__('Hello %s,

Your account on Datawrapper has just been created.

To choose your password and to activate your account please click on this link.

%s

See you soon'), $name, $invitationLink);