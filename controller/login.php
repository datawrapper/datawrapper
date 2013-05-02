<?php

//GET route
$app->get('/login', function () use ($app) {
    //disable_cache($app);
    if (DatawrapperSession::getUser()->isLoggedIn()) $app->redirect('/');

    $page = array(
        'title' => 'Datawrapper',
        'pageClass' => 'login'
    );
    add_header_vars($page, '');
    $app->render('login-page.twig', $page);
});

