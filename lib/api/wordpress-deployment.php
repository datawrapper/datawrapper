<?php

/*
 * accepts push notifications from wordpress
 */

$app->post('/wordpress', function() use ($app) {

    if (defined('WORDPRESS_SECRET')) {
        // check that the request comes from the right server
        $wordpress_ips = array('176.9.139.73');
        if (in_array($_SERVER['REMOTE_ADDR'], $wordpress_ips)) {
            if ($app->request()->post('secret') == WORDPRESS_SECRET) {
                file_put_contents("../../scripts/new_wp_content.txt", "1");
                $app->status(200);
                print "ok.";
                return;
            }
        }
    }
    $app->notFound();
});

$app->get('/worpress', function() use ($app) {
    $app->notFound();
});