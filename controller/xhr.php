<?php

/*
 * these controllers return small pieces of the UI
 */

/**
 * reloads the header menu after login/logout
 */
$app->get('/xhr/header/:page', function($active) use ($app) {
    $page = array();
    add_header_vars($page, $active);
    $app->render('header.twig', $page);
});

/**
 * reloads the header menu after login/logout
 */
$app->get('/xhr/home-login', function() use ($app) {
    $page = array();
    add_header_vars($page);
    $app->render('home-login.twig', $page);
});
