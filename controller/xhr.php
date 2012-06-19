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

/*
 * reloads chart specific options
 */

require_once '../lib/utils/visualizations.php';

$app->get('/xhr/:chartid/vis-options', function($id) use ($app) {
    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = array(
            'vis' => get_visualization_meta($chart->getType()),
        );
        $app->render('vis-options.twig', $page);
    });
});