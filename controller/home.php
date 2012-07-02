<?php

//GET route
$app->get('/', function () use ($app) {
    $page = array('title' => 'Datawrapper');
    add_header_vars($page, '');
    $app->render('home.twig', $page);
});