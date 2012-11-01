<?php

require_once '../lib/utils/themes.php';
require_once '../lib/utils/visualizations.php';

function gal_nbChartsByMonth($user) {
    $con = Propel::getConnection();
    $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) c FROM chart WHERE author_id = ". $user->getId() ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY ym ORDER BY ym DESC ;";
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

function gal_nbChartsByLayout($user) {
    $con = Propel::getConnection();
    $sql = "SELECT theme, COUNT(*) c FROM chart WHERE author_id = ". $user->getId() ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY theme ORDER BY c DESC ;";
    $rs = $con->query($sql);
    $res = array();
    foreach ($rs as $r) {
        $theme = get_theme_meta($r['theme']);
        $res[] = array('count' => $r['c'], 'id' => $r['theme'], 'name' => $theme['title']);
    }
    return $res;
}

$app->get('/gallery/?', function () use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $page = array(
            'charts' => ChartQuery::create()->getPublicGalleryCharts()
        );

        add_header_vars($page, 'mycharts');
        $app->render('gallery.twig', $page);
    } else {
        error_mycharts_need_login();
    }
});

$app->get('/gallery/by/:key/:val', function ($key, $val) use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $page = array(
            'charts' => ChartQuery::create()->getPublicChartsByUser($user, $key, $val)
        );

        add_header_vars($page, 'mycharts');
        $app->render('gallery.twig', $page);
    } else {
        error_mycharts_need_login();
    }
});