<?php

//GET route
$app->get('/settings', function () use ($app) {
    $page = array('title' => 'Datawrapper');
    add_header_vars($page, 'user');
    $app->render('settings.twig', $page);
});