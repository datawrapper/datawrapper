<?php

require_once 'docs-pages.php';

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