<?php

function get_visualizations_meta($pathToStatic = '') {
    $res = array();
    $vis_path = $pathToStatic . 'static/visualizations';
    $files = glob($vis_path . '/*/meta.json');
    if (count($files) > 0) {
        foreach ($files as $file) {
            $meta = json_decode(file_get_contents($file), true);
            $meta['id'] = substr($file, strlen($vis_path)+1, -10);
            $res[] = $meta;
        }
    }
    return $res;
}


function get_visualization_meta() {
    $res = array();
    $vis_path = 'static/visualizations';
    $files = glob($vis_path . '/*/meta.json');
    if (count($files) > 0) {
        foreach ($files as $file) {
            $meta = json_decode(file_get_contents($file), true);
            $meta['id'] = substr($file, strlen($vis_path)+1, -10);
            $res[] = $meta;
        }
    }
    return $res;
}
