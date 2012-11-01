<?php

require_once '../lib/utils/themes.php';
require_once '../lib/utils/visualizations.php';

function gal_nbChartsByMonth($user) {
    $con = Propel::getConnection();
    $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) c FROM chart WHERE show_in_gallery AND deleted = 0 AND last_edit_step >= 2 GROUP BY ym ORDER BY ym DESC ;";
    $rs = $con->query($sql);
    $res = array();
    foreach ($rs as $r) {
        $res[] = array('count' => $r['c'], 'id' => $r['ym'], 'name' => strftime('%B %Y', strtotime($r['ym'].'-01')));
    }
    return $res;
}

function gal_nbChartsByType($user) {
    $con = Propel::getConnection();
    $sql = "SELECT type, COUNT(*) c FROM chart WHERE author_id = ". $user->getId() ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY type ORDER BY c DESC ;";
    $rs = $con->query($sql);
    $res = array();

    foreach ($rs as $r) {
        $vis = get_visualization_meta($r['type']);
        $lang = substr(DatawrapperSession::getLanguage(), 0, 2);
        if (empty($vis['title'][$lang])) $lang = 'en';
        $res[] = array('count' => $r['c'], 'id' => $r['type'], 'name' => $vis['title'][$lang]);
    }
    return $res;
}


$app->get('/gallery(/?|/by/:key/:val)', function ($key = false, $val = false) use ($app) {
    $user = DatawrapperSession::getUser();
    $page = $app->request()->params('page');
    if (empty($page)) $page = 0;
    $perPage = 15;
    $start = $page * $perPage;
    $charts =  ChartQuery::create()->getGalleryCharts($key, $val, $start, $perPage);
    $total = ChartQuery::create()->countGalleryCharts();
    $pgs = array();
    $p_min = 0;
    $p_max = $lastPage = floor($total / $perPage) - 1;

    if ($page == 0) $p_max = min($lastPage, $page + 4);
    else if ($page == 1) $p_max = min($lastPage, $page + 3);
    else $p_max = min($lastPage, $page + 2);

    if ($page == $lastPage) $p_min = max(0, $page - 4);
    else if ($page == $lastPage-1) $p_min = max(0, $page - 3);
    else $p_min = max(0, $page - 2);

    for ($p = $p_min; $p <= $p_max; $p++) $pgs[] = $p;
    $vars = array(
        'charts' => $charts,
        'pager' => array(
            'pages' => $pgs,
            'first' => 0,
            'current' => $page,
            'last' => floor($total / $perPage) - 1
        )
    );
    add_header_vars($vars, 'gallery');
    $app->render('gallery.twig', $vars);
});
