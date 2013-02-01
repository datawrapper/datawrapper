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
    return $err;
}

function check_database() {
    
}

function check_server() {
    $error = false;
    $paths = check_path_permissions();
    if (count($paths) > 0) $error = true;

    if ($error) {
        print '<html><head><title>Datawrapper</title></head><body>';
        print '<div style="border-radius:20px;background:#ffc; border:1px solid #eea; padding: 30px;width:700px;margin:30px auto;font-size:18px;font-family:Helvetica Neue;font-weight:300">';
        print '<style>h2 { font-weight: 400; font-size: 20px; color: #b20 } ul li { font-size: 18px }</style>';
        print '<h1 style="margin:0 0 30px;font-size:32px;line-height:30px;letter-spacing:-1px;color:#531">Whoops! There\'s something wrong with your Datawrapper instance!</h1>';
        if (count($paths) > 0) {
            print '<h2>The following folders on your server need to be writable:</h2><ul>';
            foreach ($paths as $path) {
                # code...
                print '<li><code>'.dirname(dirname(dirname(__FILE__))).$path.'</code></li>';
            }
            print '</ul>';
            print 'Read more about <a href="http://codex.wordpress.org/Changing_File_Permissions#Using_an_FTP_Client">how to change file permissions</a>';
        }

        print '</div></body></html>';
        exit();
    }
}