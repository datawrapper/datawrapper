<?php

//GET route
$app->get('/account/settings/', function () use ($app) {
    disable_cache($app);

    $page = array('title' => __('Settings'), 'api_user' => 'current');
    add_header_vars($page, 'user');

    $user = DatawrapperSession::getUser();

     if ($user->getRole() == 'guest') {
        error_settings_need_login();
        return;
    }

    if ($user->isAdmin()) {
        // admins can edit settings for other users
        $req = $app->request();
        if ($req->get('uid') != null) {
            $u = UserQuery::create()->findPk($req->get('uid'));
            if ($u) {
                $user = $page['user'] = $u;
                $page['api_user'] = $user->getId();
            }
        }
    }

    if ($app->request()->get('token')) {
        // look for action with this token
        $t = ActionQuery::create()
            ->filterByUser($user)
            ->filterByKey('email-change-request')
            ->orderByActionTime('desc')
            ->findOne();
        if (!empty($t)) {
            // check if token is valid
            $params = json_decode($t->getDetails(), true);
            if (!empty($params['token']) && $params['token'] == $app->request()->get('token')) {
                // token matches
                $user->setEmail($params['new-email']);
                $user->save();
                $page['new_email_confirmed'] = true;
                // clear token to prevent future changes
                $params['token'] = '';
                $t->setDetails(json_encode($params));
                $t->save();
            }
        }
    }

    if ($user->getRole() == 'pending') {
        $t = ActionQuery::create()
            ->filterByUser($user)
            ->filterByKey('resend-activation')
            ->orderByActionTime('desc')
            ->findOne();
        if (empty($t)) {
            $t = $user->getCreatedAt('U');
        } else {
            $t = $t->getActionTime('U');
        }
        $page['activation_email_date'] = strftime('%x', $t);
    }

    $app->render('settings.twig', $page);
});