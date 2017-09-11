<?php

/*
 * checks if `prevent_chart_preview_in_iframes` is set in config
 * and sends X-FRAME-OPTIONS response header.
 *
 * domains can be white-listed using `allow_preview_domains`
 */
function check_iframe_origin($app) {
    $config = $GLOBALS['dw_config'];
    if (!empty($config['prevent_chart_preview_in_iframes'])) {
        // prevent this url from being rendered in iframes on different
        // domains, mainly to protect server resources
        $response = $app->response();
        $response['X-Frame-Options'] = 'SAMEORIGIN';
        $headers = $app->request()->headers();
        if (isset($config['allow_preview_domains']) && isset($headers['REFERER'])) {
            $referrer = $headers['REFERER'];
            $url = parse_url($referrer);
            $allow_hosts = $config['allow_preview_domains'];
            if (in_array($url['host'], $allow_hosts)) {
                unset($response['X-Frame-Options']);
            }
        }
    }
}