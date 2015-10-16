<?php

DatawrapperHooks::register(DatawrapperHooks::SEND_ACTIVATION_EMAIL,
    function ($userEmail, $userName, $activationLink) {

    }
);

DatawrapperHooks::register(DatawrapperHooks::SEND_TEAM_INVITE_EMAIL,
    function ($userEmail, $userName, $teamName, $activationLink) {
 
    }
);

DatawrapperHooks::register(DatawrapperHooks::SEND_TEAM_INVITE_EMAIL_TO_NEW_USER,
    function ($userEmail, $userName, $teamName, $activationLink) {

    }
);

DatawrapperHooks::register(DatawrapperHooks::SEND_RESET_PASSWORD_EMAIL, 
    function ($userEmail, $userName, $passwordResetLink) {

    }
);

DatawrapperHooks::register(DatawrapperHooks::SEND_CHANGE_EMAIL_EMAIL,
    function ($userEmail, $userName, $oldEmail, $confirmationLink) {

    }
);
