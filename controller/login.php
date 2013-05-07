<?php

//GET route
$app->get('/login', function () use ($app) {
    //disable_cache($app);
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

