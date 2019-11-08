<?php

// DEPRECATED
$app->put('/team/:org_id/activate', function($org_id) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    if ($org_id === '@none') {
        $user->setUserData(['active_team' => '%none%']);
        $_SESSION['dw-user-organization'] = '%none%';
        print json_encode(array('status' => 'ok'));
        return;
    }
    $orgs = $user->getActiveOrganizations();
    foreach ($orgs as $org) {
        if ($org->getId() == $org_id) {
            $user->setUserData(['active_team' => $org_id]);
            $_SESSION['dw-user-organization'] = $org_id;
            print json_encode(array('status' => 'ok'));
            return;
        }
    }
    print json_encode(array(
        'status' => 'error',
        'message'=> __('Organization not found')
    ));
});