<?php

function add_docs_vars(&$page, $active_url) {
    global $docs;
    $page['navigation'] = array();
    foreach ($docs as $url => $title) {
        $page['navigation'][] = array('url' => $url, 'title' => $title, 'active' => $active_url == $url);
    }
}

$docs = array(
    '/docs/about' => _('About'),
    '/docs/motivation' => 'Motivation',
    '/docs/quickstart' => 'Quickstart',
    '/docs/tutorial' => 'Tutorial',
    '/docs/upload' => 'Uploading Data',
    '/docs/describe' => 'Describing Data',
    '/credits' => 'Credits',
    '/terms' => 'Terms of Service'
);