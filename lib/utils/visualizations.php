<?php



function get_visualizations_meta() {
    $res = array();
    $vis_path = ROOT_PATH . 'www/static/visualizations';
    $files = glob($vis_path . '/*/meta.json');
    if (count($files) > 0) {
        foreach ($files as $file) {
            $meta = json_decode(file_get_contents($file), true);
            $meta['id'] = substr($file, strlen($vis_path)+1, -10);
            $res[] = $meta;
        }
    }
    // sort by something
    usort($res, function ($a, $b) {
        if (!isset($a['order'])) $a['order'] = 99999;
        if (!isset($b['order'])) $b['order'] = 99999;
        return $a['order'] - $b['order'];
    });
    return $res;
}


function get_visualization_meta($id) {
    $res = array();
    $vis_path = ROOT_PATH . 'www/static/visualizations/' . $id .'/meta.json';
    if (file_exists($vis_path)) {
        $meta = json_decode(file_get_contents($vis_path), true);
        $meta['id'] = $id;
        $meta['hasCSS'] = file_exists(ROOT_PATH . 'www/static/visualizations/' . $id . '/style.css');
        return $meta;
    }
    return false;
}
