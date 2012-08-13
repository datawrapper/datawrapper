<?php

/*
 *  handles push requests by github
 */
$app->post('/github', function() use ($app) {

    if (defined('GITHUB_REPO_URL')) {

        $payload = json_decode($app->request()->post('payload'));

        $headers = 'From: update-notify@' . DW_DOMAIN . "\r\n";
        $headers .= 'CC: ' . $payload->pusher->email . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

        // debug mail
        // mail(ADMIN_LOG_EMAIL, 'Datawrapper Github Push!', "REMOTE_ADDR: " . $_SERVER['REMOTE_ADDR'] . "\n\n" . $app->request()->post('payload'), $headers);

        // check if the request comes from github server
        $github_ips = array('207.97.227.253', '50.57.128.197', '108.171.174.178');
        if (in_array($_SERVER['REMOTE_ADDR'], $github_ips)) {
            // check wether the push came from the right repository
            if ($payload->repository->url == GITHUB_REPO_URL && $payload->ref == 'refs/heads/' . GITHUB_REPO_BRANCH) {
                $body = '<p>The Github user <a href="https://github.com/'. $payload->pusher->name .'">@' . $payload->pusher->name . '</a>'
                  . ' has pushed to ' . $payload->repository->url
                  . ' and consequently, the instance of Datawrapper runnig at ' . DW_DOMAIN
                  . ' has been updated.</p><p>Cheers, <br/>The friendly Datawrapper bot</p>';

                mail(ADMIN_LOG_EMAIL, 'Datawrapper has been updated', $body, $headers);

                $cmd = '/bin/sh ' . dirname(dirname(__FILE__)) . '/scripts/deploy.sh';
                exec($cmd);
            }
        } else {
            error('untrusted-origin', 'This does not appear to be a valid requests from Github.');
        }
    }

});
