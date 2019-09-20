<?php


/**
 * AJAX Cross Domain (PHP) Proxy 0.8
 * Copyright (C) 2016 Iacovos Constantinou (https://github.com/softius)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Enables or disables filtering for cross domain requests.
 * Recommended value: true
 */
define('CSAJAX_FILTERS', true);

/**
 * If set to true, $valid_requests should hold only domains i.e. a.example.com, b.example.com, usethisdomain.com
 * If set to false, $valid_requests should hold the whole URL ( without the parameters ) i.e. http://example.com/this/is/long/url/
 * Recommended value: false (for security reasons - do not forget that anyone can access your proxy)
 */
define('CSAJAX_FILTER_DOMAIN', true);

/**
 * Set debugging to true to receive additional messages - really helpful on development
 */
define('CSAJAX_DEBUG', false);

/**
 * A set of valid cross domain requests
 */
$valid_requests = array(
    'api.fitchconnect-qa.com',
    'app.fitchconnect-qa.com',
    'auth.fitchconnect-qa.com',
    'api.fitchconnect-stg.com',
    'app.fitchconnect-stg.com',
    'auth.fitchconnect-stg.com',
    'api.fitchconnect.com',
    'app.fitchconnect.com',
    'auth.fitchconnect.com'
);

/**
 * Set extra multiple options for cURL
 * Could be used to define CURLOPT_SSL_VERIFYPEER & CURLOPT_SSL_VERIFYHOST for HTTPS
 * Also to overwrite any other options without changing the code
 * See http://php.net/manual/en/function.curl-setopt-array.php
 */
$curl_options = array(
    // CURLOPT_SSL_VERIFYPEER => false,
    // CURLOPT_SSL_VERIFYHOST => 2,
);

/* * * STOP EDITING HERE UNLESS YOU KNOW WHAT YOU ARE DOING * * */

// identify request headers
$request_headers = array( );
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        $headername = str_replace('_', ' ', str_replace('HTTP_', '', $key));
        $headername = str_replace(' ', '-', ucwords(strtolower($headername)));
        if (!in_array($headername, array( 'Host', 'X-Proxy-Url' ))) {
            $request_headers[] = "$headername: $value";
        }
    }
}

// identify request method, url and params
$request_method = $_SERVER['REQUEST_METHOD'];
if ('GET' == $request_method) {
    $request_params = $_GET;
} elseif ('POST' == $request_method) {
    $request_params = $_POST;
    if (empty($request_params)) {
        $data = file_get_contents('php://input');
        if (!empty($data)) {
            $request_params = $data;
        }
    }
} elseif ('PUT' == $request_method || 'DELETE' == $request_method) {
    $request_params = file_get_contents('php://input');
} else {
    $request_params = null;
}

// Get URL from `csurl` in GET or POST data, before falling back to X-Proxy-URL header.
if (isset($_REQUEST['csurl'])) {
    $request_url = urldecode($_REQUEST['csurl']);
} elseif (isset($_SERVER['HTTP_X_PROXY_URL'])) {
    $request_url = urldecode($_SERVER['HTTP_X_PROXY_URL']);
} else {
    header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
    header('Status: 404 Not Found');
    $_SERVER['REDIRECT_STATUS'] = 404;
    exit;
}

$p_request_url = parse_url($request_url);

// csurl may exist in GET request methods
if (is_array($request_params) && array_key_exists('csurl', $request_params)) {
    unset($request_params['csurl']);
}

if (is_array($request_params) && array_key_exists('url', $request_params)) {
    unset($request_params['url']);
}

// ignore requests for proxy :)
if (preg_match('!' . $_SERVER['SCRIPT_NAME'] . '!', $request_url) || empty($request_url) || count($p_request_url) == 1) {
    csajax_debug_message('Invalid request - make sure that csurl variable is not empty');
    exit;
}

// check against valid requests
if (CSAJAX_FILTERS) {
    $parsed = $p_request_url;
    if (CSAJAX_FILTER_DOMAIN) {
        if (!in_array($parsed['host'], $valid_requests)) {
            csajax_debug_message('Invalid domain - ' . $parsed['host'] . ' does not included in valid requests');
            exit;
        }
    } else {
        $check_url = isset($parsed['scheme']) ? $parsed['scheme'] . '://' : '';
        $check_url .= isset($parsed['user']) ? $parsed['user'] . ($parsed['pass'] ? ':' . $parsed['pass'] : '') . '@' : '';
        $check_url .= isset($parsed['host']) ? $parsed['host'] : '';
        $check_url .= isset($parsed['port']) ? ':' . $parsed['port'] : '';
        $check_url .= isset($parsed['path']) ? $parsed['path'] : '';
        if (!in_array($check_url, $valid_requests)) {
            csajax_debug_message('Invalid domain - ' . $request_url . ' does not included in valid requests');
            exit;
        }
    }
}

// append query string for GET requests
if ($request_method == 'GET' && count($request_params) > 0 && (!array_key_exists('query', $p_request_url) || empty($p_request_url['query']))) {
    $request_url .= '?' . http_build_query($request_params);
}

// let the request begin
$ch = curl_init($request_url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers);   // (re-)send headers
curl_setopt($ch,CURLOPT_ENCODING , "gzip");

// add data for POST, PUT or DELETE requests
if ('POST' == $request_method) {
    $post_data = is_array($request_params) ? http_build_query($request_params) : $request_params;
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS,  $post_data);
} elseif ('PUT' == $request_method || 'DELETE' == $request_method) {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $request_method);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $request_params);
}

// Set multiple options for curl according to configuration
if (is_array($curl_options) && 0 <= count($curl_options)) {
    curl_setopt_array($ch, $curl_options);
}

// retrieve response (headers and content)
$response = curl_exec($ch);
curl_close($ch);

