<?php

// TODO: cache file i/o

function get_themes_meta() {
    $res = array();
    $files = glob('static/themes/*/meta.json');
    if (count($files) > 0) {
        foreach ($files as $file) {
            $id = substr($file, 14, -10);
            $meta = get_theme_meta($id);
            $res[] = $meta;
        }
    }
    return $res;
}

function get_theme_meta($id) {
    $meta = json_decode(file_get_contents('static/themes/' . $id . '/meta.json'), true);
    $meta['id'] = $id;
    $meta['hasStyles'] = file_exists('static/themes/' . $id . '/theme.css');
    $meta['hasTemplate'] = file_exists('../templates/themes/' . $id . '.twig');
    if (empty($meta['extends'])) $meta['extends'] = null;
    return $meta;
}