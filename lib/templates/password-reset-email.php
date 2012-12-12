<?php

/*
 * template for the Datawrapper activation email
 */

$password_reset_mail = sprintf(_('Hello %s,

Someone, probably you, filed a request to reset your password.

If that\'s true, please click the following link to reset your password.

%s

If you ignore this email, your password stays the same as before.

Best,
Datawrapper'), $name, $passwordResetLink);