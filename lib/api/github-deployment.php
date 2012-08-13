<?php

/*
 *
 */
$app->post('/github', function() use ($app) {
    $from = 'update-notify@' . DW_DOMAIN;
    $payload = $app->request()->post('payload');
    $body = "REMOTE_ADDR: " . $_SERVER['REMOTE_ADDR'] . "\n\n" . $payload;
    mail(ADMIN_LOG_EMAIL, 'Datawrapper has been updated!', $body, 'From: ' . $from);

    // handles push requests by github
    // check if the request comes from github server
    $github_ips = array('207.97.227.253', '50.57.128.197', '108.171.174.178');
    if (in_array($_SERVER['REMOTE_ADDR'], $github_ips)) {
        $payload = json_decode($payload);
        // check wether the push came from the right repository
        if ($payload->repository->url == GITHUB_REPO_URL) {
            mail(ADMIN_LOG_EMAIL, 'Payload accepted', $body, 'From: ' . $from);
        }
        // $cmd = dirname(dirname(__FILE__)).'/scripts/deploy.sh';
        // exec($cmd);
    } else {
        error('untrusted-origin', 'This does not appear to be a valid requests from Github.');
    }
});

