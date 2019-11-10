<?php

$app->get('/datawrapper-invite/:invite_token', function ($invite_token) use ($app) {
    disable_cache($app);

    $user = DatawrapperSession::getUser();

    if ($user->isLoggedIn()) {
          error_page(1, __("settings / invite / logged-in / heading"), __("settings / invite / logged-in / message"));
          return;
    }


    $invitee = UserQuery::create()
        ->filterByActivateToken($invite_token)
        ->findOne();

    if (empty($invitee)) {
        error_page(1, __("settings / invite / expired / heading"), __("settings / invite / expired / message"));
         return;
    }

    $page = array();
    add_header_vars($page, 'about');
    $page['salt'] = DW_AUTH_SALT;
    $page['alert'] = array("message" => __("settings / invite / set-password-alert"));

    $app->render('team/invite.twig', $page);
});

$app->get('/datawrapper-invite/:invite_token/finish', function ($invite_token) use ($app) {
    disable_cache($app);

    if (DatawrapperSession::isLoggedIn()) {
        $invite = UserOrganizationQuery::create()
            ->filterByInviteToken($invite_token)
            ->findOne();

        if (empty($invite)) {
            $app->redirect('/team/new/setup');
            return;
        }

        Propel::getConnection()->query('UPDATE user_organization SET invite_token = "" '.
            ' WHERE user_id = '.$invite->getUserId().
            ' AND organization_id = "'.$invite->getOrganizationId().'"');

        DatawrapperHooks::execute(DatawrapperHooks::USER_ORGANIZATION_ADD,
            $invite->getOrganization(), $invite->getUser());

        $app->redirect('/team/' . $invite->getOrganizationId());
    }
});

$app->get('/organization-invite/:invite_token', function ($invite_token) use ($app) {
    disable_cache($app);

    $user = DatawrapperSession::getUser();

    $invitee = UserQuery::create()
        ->leftJoin('UserOrganization')
        ->where('UserOrganization.InviteToken = ?', $invite_token)
        ->withColumn('UserOrganization.InviteToken', 'InviteToken')
        ->withColumn('UserOrganization.OrganizationId', 'InviteOrganization')
        ->findOne();

    if (empty($invitee)) {
          error_page(1, "Expired Link", "This link is invalid or has expired.");
          return;
    }

    if ($invitee->getId() != $user->getId()) {
        if ($user->isLoggedIn()) {
            $errorHeading = __("settings / invite / wrong-user / heading");
            $errorMsg = __("settings / invite / wrong-user / message");
            $errorMsg = str_replace("%activeemail%", $user->getEmail(), $errorMsg);
        } else {
            $errorHeading = __("settings / invite / not-logged-in / heading");
            $errorMsg = __("settings / invite / not-logged-in / message");
        }

        $errorMsg = str_replace("%email%", $invitee->getEmail(), $errorMsg);

        error_page(1, $errorHeading, $errorMsg);

        return;
    }

    Propel::getConnection()->query('UPDATE user_organization SET invite_token = "" '.
            ' WHERE user_id = '.$invitee->getId().
            ' AND organization_id = "'.$invitee->getInviteOrganization().'"');

    DatawrapperHooks::execute(DatawrapperHooks::USER_ORGANIZATION_ADD,
      $invitee->getInviteOrganization(), $invitee);

    $app->redirect('/team/' . $invitee->getInviteOrganization());
});