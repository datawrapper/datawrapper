<?php

require_once '../lib/utils/themes.php';
require_once '../lib/utils/visualizations.php';

function gal_nbChartsByMonth() {
    $con = Propel::getConnection();
    $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) c FROM chart WHERE show_in_gallery = 1 AND deleted = 0 GROUP BY ym ORDER BY ym DESC ;";
    $rs = $con->query($sql);
    $res = array();
    foreach ($rs as $r) {
        $res[] = array('count' => $r['c'], 'id' => $r['ym'], 'name' => strftime('%B %Y', strtotime($r['ym'].'-01')));
    }
    return $res;
}

function gal_nbChartsByType() {
    $con = Propel::getConnection();
    $sql = "SELECT type, COUNT(*) c FROM chart WHERE show_in_gallery = 1 AND deleted = 0 GROUP BY type ORDER BY c DESC ;";
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
    $curPage = $app->request()->params('page');
    if (empty($curPage)) $curPage = 0;
    $perPage = 12;
    $filter = !empty($key) ? array($key => $val) : array();

    $charts =  ChartQuery::create()->getGalleryCharts($filter, $curPage * $perPage, $perPage);
    $total = ChartQuery::create()->countGalleryCharts($filter);

    $page = array(
        'charts' => $charts,
        'bymonth' => gal_nbChartsByMonth(),
        'byvis' => gal_nbChartsByType(),
        'key' => $key,
        'val' => $val
    );
    add_pagination_vars($page, $total, $curPage, $perPage);
    add_header_vars($page, 'gallery');
    $app->render('gallery.twig', $page);
});
