<?php

/*
 * this page shows up if an user has been invited to
 * datawrapper and therefor only needs to pick a password
 * to complete the registration process.
 */
$app->get('/account/set-password/:token', function ($token) use ($app) {
    disable_cache($app);
    if (!empty($token)) {
        $users = UserQuery::create()
          ->filterByActivateToken($token)
          ->find();

        if (count($users) != 1) {
            $app->redirect('/?t=e&m='.__('This activation token is invalid. Your email address is probably already activated.'));
        } else {
            $page = array();
            add_header_vars($page, 'about');
            $page['salt'] = DW_AUTH_SALT;
            $app->render('account/set-password.twig', $page);
        }
    } else $app->notFound();
});
