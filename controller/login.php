<?php

//GET route
$app->get('/login', function () use ($app) {
    disable_cache($app);
    if (DatawrapperSession::getUser()->isLoggedIn()) $app->redirect('/');

    $page = array(
        'title' => 'Datawrapper',
        'pageClass' => 'login',
        'noHeader' => true,
        'noFooter' => true,
        'noSignup' => true
    );
    add_header_vars($page, '');
    $app->render('login-page.twig', $page);

});

//GET route
$app->get('/setup', function () use ($app) {

    disable_cache($app);
    if (DatawrapperSession::getUser()->isLoggedIn()
        || UserQuery::create()->filterByRole(array('admin', 'sysadmin'))->count() > 0) $app->redirect('/');

    $page = array(
        'title' => 'Datawrapper',
        'pageClass' => 'setup',
        'noHeader' => true,
        'noFooter' => true,
        'noSignup' => true,
        'auth_salt' => DW_AUTH_SALT
    );
    add_header_vars($page, '');
    $app->render('setup.twig', $page);

});

/*
 * endpoint for final setup script
 */
$app->post('/setup', function() use ($app) {
    $data = json_decode($app->request()->getBody());

    // check that there is no admin user yet (only true right after setup)
    if (UserQuery::create()->count() == 0) {
        $user = new User();
        $user->setCreatedAt(time());
        $user->setEmail($data->email);
        $user->setRole('admin');
        $user->setPwd($data->pwd);
        $user->setLanguage(DatawrapperSession::getLanguage());
        $user->save();

        DatawrapperSession::login($user);
        $app->redirect('/');
    } else {
        print json_encode(array('status' => 'fail'));
    }
});
