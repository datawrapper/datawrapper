<?php

//GET route
$app->get('/account/settings', function () use ($app) {
    $page = array('title' => 'Datawrapper');
    add_header_vars($page, 'user');
    $app->render('settings.twig', $page);
});