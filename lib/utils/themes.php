<?php

function get_themes_meta() {
    $res = array();
    $files = glob('static/themes/*/meta.json');
    if (count($files) > 0) {
        foreach ($files as $file) {
            $meta = json_decode(file_get_contents($file), true);
            $meta['id'] = substr($file, 14, -10);
            $res[] = $meta;
        }
    }
    return $res;
}