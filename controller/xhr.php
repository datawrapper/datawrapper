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
    $res = $app->response();
    $res['Cache-Control'] = 'max-age=0';
    $app->render('header.twig', $page);
});

/**
 * reloads the header menu after login/logout
 */
$app->get('/xhr/home-login', function() use ($app) {
    $page = array();
    add_header_vars($page);
    $res = $app->response();
    $res['Cache-Control'] = 'max-age=0';
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
            'language' => substr(DatawrapperSession::getLanguage(), 0, 2)
        );
        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';
        $app->render('vis-options.twig', $page);
    });
});

/**
 * load a page from the docs for a modal window
 */
require_once '../templates/imported/pages.inc.php';

$urls = array();

foreach ($docs_pages as $lang => $pages) {
    foreach ($pages as $url => $p) {
        if (!in_array($url, $urls)) $urls[] = $url;
    }
}

foreach ($urls as $url) {
    $app->get('/popup/' . $url, function() use ($app, $url, $docs_pages) {
        $page = array();
        add_header_vars($page, 'about');
        $lang = $page['language'];
        $tpl_path = 'imported/' . $lang . '/' . str_replace('/', '-', $url) . '.twig';
        if (!empty($docs_pages[$lang]) && !empty($docs_pages[$lang][$url])) {
            $page['title'] = $docs_pages[$lang][$url]['title'];
            add_docs_vars($page, $url);
            $page['xhr'] = true;
            $app->render($tpl_path, $page);
        } else {
            error_page('about', _('Not found'), _('Sorry, but this content is not available in your language, yet.'));
        }
    });
}
