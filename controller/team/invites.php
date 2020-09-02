<?php

require_once ROOT_PATH . 'lib/utils/call_v3_api.php';

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

    $userOrg = UserOrganizationQuery::create()
        ->filterByInviteToken($invite_token)
        ->findOne();

    $page = array();
    add_header_vars($page, 'about');
    $page['message_h1'] = str_replace('%s', htmlspecialchars($userOrg->getOrganization()->getName()), __('team / invite / headline'));
    $page['message_p'] = __('team / invite / intro');
    $page['message_button'] = 'Set password &amp; join team';
    $page['email'] = $invitee->getEmail();
    $page['redirect'] = '/datawrapper-invite/'.$invite_token.'/finish';
    $page['salt'] = DW_AUTH_SALT;
    $page['alert'] = array("message" => __("settings / invite / set-password-alert"));

    $app->render('account/invite.twig', $page);
});

$app->get('/datawrapper-invite/:invite_token/finish', function ($token) use ($app) {
    disable_cache($app);

    if (DatawrapperSession::isLoggedIn()) {
        $invite = UserOrganizationQuery::create()
            ->filterByInviteToken($token)
            ->findOne();

        if (empty($invite)) {
            $app->redirect('/team/new/setup');
            return;
        }

        [$status, $body] = call_v3_api('POST', '/teams/'.$invite->getOrganizationId().'/invites/'.$token);

        if ($status === 201) {
            $app->redirect('/team/' . $invite->getOrganizationId());
        } else {
            error_page(1, "Expired Link", "This link is invalid or has expired.");
        }
    }
});

/**
 * @deprecated
 * Use `/team/:id/invite/:token/accept instead
 */
$app->get('/organization-invite/:invite_token', function ($token) use ($app) {
    disable_cache($app);

    $row = UserOrganizationQuery::create()
        ->filterByInviteToken($token)
        ->findOne();

    if (empty($row)) {
        return error_page(1, "Expired Link", "This link is invalid or has expired.");
    }

    $app->redirect('/team/' . $row->getOrganizationId() . '/invite/' . $token . '/accept');
});

/**
 * accept team invitation
 */
$app->get('/team/:id/invite/:invite_token/accept', function($teamId, $token) use ($app) {
    disable_cache($app);

    $user = DatawrapperSession::getUser();

    $invitee = UserQuery::create()
        ->leftJoin('UserOrganization')
        ->where('UserOrganization.InviteToken = ?', $token)
        ->withColumn('UserOrganization.InviteToken', 'InviteToken')
        ->withColumn('UserOrganization.OrganizationId', 'InviteOrganization')
        ->findOne();

    if (empty($invitee)) {
        return error_page(1, "Expired Link", "This link is invalid or has expired.");
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

        return error_page(1, $errorHeading, $errorMsg);
    }

    [$status, $body] = call_v3_api('POST', '/teams/'.$teamId.'/invites/'.$token);
    if ($status === 201) {
        $app->redirect('/team/' . $teamId);
    } else {
        error_page(1, "Expired Link", "This link is invalid or has expired.");
    }
});

/**
 * reject team invitation
 */
$app->get('/team/:id/invite/:invite_token/reject', function($teamId, $token) use ($app) {
    disable_cache($app);
    [$status, $body] = call_v3_api('DELETE', '/teams/'.$teamId.'/invites/'.$token);
    if ($status === 204) {
        if (DatawrapperSession::isLoggedIn()) {
            $teamName = OrganizationQuery::create()->findPk($teamId)->getName();
            $app->redirect('/?t=s&m='.urlencode(str_replace('%s', $teamName, __('teams / reject-invitation / success'))));
        } else {
            $app->redirect('https://www.datawrapper.de/?teamRejectSuccess');
        }
    } else {
        error_page(1, "Expired Link", "This link is invalid or has expired.");
    }
});
