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

/**
 * reloads visualization specific options after the user
 * changed the visualization type
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

/**
 * load a page from the docs for a modal window
 */
require_once '../lib/templates/docs-pages.php';

foreach ($docs as $url => $title) {
    $app->get('/xhr' . $url, function() use ($app, $url, $title) {
        $page = array('title' => $title);
        add_header_vars($page, 'about');
        add_docs_vars($page, $url);
        $page['xhr'] = true;
        $app->render(str_replace('/', '-', substr($url, 1)) . '.twig', $page);
    });
}