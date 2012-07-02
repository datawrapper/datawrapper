<?php

$docs = array(
    '/docs/about' => 'About',
    '/docs/quickstart' => 'Quickstart',
    '/docs/motivation' => 'Motivation',
    '/credits' => 'Credits',
    '/terms' => 'Terms of Service'
);


function add_docs_vars(&$page, $active_url) {
    global $docs;
    $page['navigation'] = array();
    foreach ($docs as $url => $title) {
        $page['navigation'][] = array('url' => $url, 'title' => $title, 'active' => $active_url == $url);
    }
}

foreach ($docs as $url => $title) {
    $app->get($url, function() use ($app, $url, $title) {
        $page = array('title' => $title);
        add_header_vars($page, 'about');
        add_docs_vars($page, $url);
        $app->render(str_replace('/', '-', substr($url, 1)) . '.twig', $page);
    });
}

$app->get('/docs', function() use ($app) {
    $app->redirect('/docs/about');
});