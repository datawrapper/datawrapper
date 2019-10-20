<?php

$app->put('/team/:org_id/leave', function($org_id) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    $orgs = $user->getActiveOrganizations();

    $userOrg = UserOrganizationQuery::create()
                    ->filterByUser($user)
                    ->filterByOrganizationId($org_id)
                    ->findOne();

    if (!$userOrg) {
        print json_encode([
            'status' => 'error',
            'message'=> __('Organization not found')
        ]);

        return;
    }

    $userOrg->delete();

    if ($_SESSION['dw-user-organization'] == $org_id) {
        $userOrg = UserOrganizationQuery::create()
                    ->filterByUser($user)
                    ->findOne();

        $_SESSION['dw-user-organization'] = $userOrg->getOrganizationId();
    }

    print json_encode(['status' => 'ok']);
});