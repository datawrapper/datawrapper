<?php

/* health check */

function check_path_permissions() {
    $paths = array();
    $rel = '..';
    $paths[] = '/charts/static';
    $paths[] = '/charts/data';
    $paths[] = '/charts/images';
    $paths[] = '/charts/data/tmp';
    $paths[] = '/vendor/htmlpurifier/standalone/HTMLPurifier/DefinitionCache/Serializer';
    $err = array();
    foreach ($paths as $path) {
        if (!is_writable($rel . $path)) $err[] = $path;
    }
    if (count($err) > 0) {
        $msg = '<h2>The following folders on your server need to be writable:</h2><ul>';
        foreach ($paths as $path) {
            # code...
            $msg .= '<li><code>'.dirname(dirname(dirname(__FILE__))).$path.'</code></li>';
        }
        $msg .= '</ul>';
        $msg .= 'Read more about <a href="http://codex.wordpress.org/Changing_File_Permissions#Using_an_FTP_Client">how to change file permissions</a>';
        return $msg;
    }
    return '';
}

function check_config() {
    if (!file_exists('../config.yaml')) {
        $error = true;
        $info['config_missing'] = true;
        return '<h2>Could not find <b>config.yaml</b></h2>'
          . '<p>Please copy the template configuration from <code>config.template.yaml</code> to <code>config.yaml</code> and change the configuration according to your server.</p>';
    }
    return '';
}

function check_database() {
    
}


function check_server() {
    $check = array();
    $check[] = 'check_config';
    $check[] = 'check_path_permissions';
    $check[] = 'check_database';

    foreach ($check as $func) {
        $msg = call_user_func($func);
        if (!empty($msg)) {
            print '<html><head><title>Datawrapper</title></head><body>';
            print '<div style="border-radius:20px;background:#ffc; border:1px solid #eea; padding: 30px;width:700px;margin:30px auto;font-size:18px;font-family:Helvetica Neue;font-weight:300">';
            print '<style>h2 { font-weight: 400; font-size: 20px; color: #b20 } ul li { font-size: 18px }</style>';
            print '<h1 style="margin:0 0 30px;font-size:32px;line-height:30px;letter-spacing:-1px;color:#531">Whoops! Something is wrong with your Datawrapper instance!</h1>';

            print $msg;
            print '</div></body></html>';
            exit();
        }
     }
}