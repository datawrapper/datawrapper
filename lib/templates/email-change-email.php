<?php

/*
 * template for the Datawrapper activation email
 */

$email_change_mail = __("
Hello %name%,

You have recently asked for a change of your email address for your Datawrapper account from %old_email% to %new_email%.

To complete this change you need to click on the following link:
%email_change_token_link%

You're email address won't be changed until you click the link above.

If you're not able to click the link above, copy it and paste it into your web browser. If you have trouble with this please FORWARD this email to %support_email% and state that you had problems changing your email address.

Best regards,
The Datawrapper Team

Please ignore this email if you received it by accident.

Please do not share this email. The activation link is secret.

");
