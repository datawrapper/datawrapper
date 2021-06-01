<?php

require_once ROOT_PATH . 'lib/utils/json_encode_safe.php';

/**
 * wrapper around our new v3 api
 */
function call_v3_api($method, $route, $payload = null, $contentType = 'application/json') {
    $apiDomain = $GLOBALS['dw_config']['api_domain'] ?? 'api.datawrapper.de';
    $protocol = get_current_protocol();
    $ch = curl_init();

    $headers = [
        'Content-Type: ' . $contentType
    ];

    $CSRF_SAFE_METHODS = ['get', 'head', 'options', 'trace']; // according to RFC7231

    if (Session::getMethod() == 'token') {
        $h = getallheaders();
        $headers[] = 'Authorization: ' . $h['Authorization'];
    } else if (!empty($_COOKIE['DW-SESSION'])) {
        $headers[] = 'Cookie: DW-SESSION='.$_COOKIE['DW-SESSION'];

        if (!in_array(strtolower($method), $CSRF_SAFE_METHODS)) {
            if (!empty($_COOKIE['crumb'])) {
                $headers[] = 'Cookie: crumb='.$_COOKIE['crumb'];
                $headers[] = 'X-CSRF-Token: '.$_COOKIE['crumb'];
                $headers[] = sprintf('Referer: %s://%s', $protocol, $GLOBALS['dw_config']['domain']);
            } else {
                $ch2 = curl_init("$protocol://$apiDomain/v3/me");

                curl_setopt_array($ch2, [
                    CURLOPT_RETURNTRANSFER => 1,
                    CURLOPT_HEADER => 1,
                    CURLOPT_HTTPHEADER => $headers,
                ]);

                $result = curl_exec($ch2);
                $err2 = curl_error($ch2);
                if ($err2) {
                    error_log('Error fetching from v3 API: ' . $err2);
                }

                preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $result, $matches);
                $cookies = array();
                foreach($matches[1] as $item) {
                    parse_str($item, $cookie);
                    $cookies = array_merge($cookies, $cookie);
                }

                if (!empty($cookies['crumb'])) {
                    $headers[] = 'Cookie: crumb='.$cookies['crumb'];
                    $headers[] = 'X-CSRF-Token: '.$cookies['crumb'];
                    $headers[] = sprintf('Referer: %s://%s', $protocol, $GLOBALS['dw_config']['domain']);
                }
            }
        }
    }

    curl_setopt_array($ch, [
        CURLOPT_URL => "$protocol://$apiDomain/v3$route",
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_NOBODY => $method === 'HEAD',
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS
    ]);
    if (!empty($payload)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $contentType == 'application/json' ? json_encode_safe($payload) : $payload);
    }
    $response = curl_exec($ch);
    $error = curl_error($ch);
    if ($error) {
        error_log('Error fetching from v3 API: ' . $error);
    }
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $attempt = 1;
    // bad gateway, let's retry this request a few times
    while ($status == 502 && $attempt < 11) {
        sleep(1);
        $attempt++;
        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    }
    $data = null;
    if (!empty($response)) {
        try {
            $data = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
        } catch (Exception $error) {
            $data = $response;
        }
    }
    curl_close($ch);
    return [$status, $data];
}
