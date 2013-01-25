<?php

/*
 * Accepts push notifications from Wordpress after the Datawrapper
 * documentation has been updated. This sets a flag which forces a
 * /scripts/update_content.phpto pull new content via Wordpress JSON API.
 */

$app->post('/wordpress', function() use ($app) {

    if (isset($GLOBALS['dw_config']['wordpress']['secret'])) {
        // check that the request comes from the right server
        $wordpress_ips = $GLOBALS['dw_config']['wordpress']['ips'];
        // always allow pushing from same IP
        $wordpress_ips[] = $_SERVER['SERVER_ADDR'];
        if (in_array($_SERVER['REMOTE_ADDR'], $wordpress_ips)) {
            if ($app->request()->post('secret') == $GLOBALS['dw_config']['wordpress']['secret']) {
                file_put_contents("../../scripts/new_wp_content.txt", "1");
                $app->status(200);
                print "ok.";
                return;
            }
        }
    }
    $app->notFound();
});

