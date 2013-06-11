<?php

/*
 *  handles push requests by github
 */
$app->post('/github', function() use ($app) {

    if (isset($GLOBALS['dw_config']['github'])) {

        $payload = json_decode($app->request()->post('payload'));

        $headers = 'From: Datawrapper Bot <update-notify@' . $GLOBALS['dw_config']['domain'] . ">\r\n";
        $headers .= 'CC: ' . $payload->pusher->email . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

        // debug mail
        // mail($GLOBALS['dw_config']['log_email'], 'Datawrapper Github Push!', "REMOTE_ADDR: " . $_SERVER['REMOTE_ADDR'] . "\n\n" . $app->request()->post('payload'), $headers);

        // check if the request comes from github server
        $github_ips = array('207.97.227.253', '50.57.128.197', '108.171.174.178', '50.57.231.61');
        if (in_array($_SERVER['REMOTE_ADDR'], $github_ips)) {
            // check wether the push came from the right repository
            if ($payload->repository->url == $GLOBALS['dw_config']['github']['repo'] && $payload->ref == 'refs/heads/' . $GLOBALS['dw_config']['github']['branch']) {
                $body = '<p>The Github user <a href="https://github.com/'. $payload->pusher->name .'">@' . $payload->pusher->name . '</a>'
                  . ' has pushed to ' . $payload->repository->url
                  . ' and consequently, the instance of Datawrapper runnig at ' . $GLOBALS['dw_config']['domain']
                  . ' has been updated.</p>';

                $body .= '<p>Here\'s a brief list of what has been changed:</p>';
                $body .= '<ul>';
                foreach ($payload->commits as $commit) {
                    $body .= '<li>'.$commit->message.'<br />';
                    $body .= '<small style="color:#999">added: <b>'.count($commit->added).'</b> &nbsp; modified: <b>'.count($commit->modified).'</b> &nbsp; removed: <b>'.count($commit->removed).'</b> &nbsp; <a href="' . $commit->url . '">read more</a></small></li>';
                }
                $body .= '</ul>';
                $body .= '<p>Cheers, <br/>The friendly Datawrapper bot</p>';

                mail();
                DatawrapperHooks::execute(DatawrapperHooks::SEND_EMAIL, $GLOBALS['dw_config']['email']['log'], 'Datawrapper has been updated', $body, $headers);

                $cmd = dirname(dirname(dirname(__FILE__))) . '/scripts/deploy.sh';
                exec($cmd);
                exit;
            }
        } else {
            error('untrusted-origin', 'This does not appear to be a valid requests from Github.');
        }
    }

});
