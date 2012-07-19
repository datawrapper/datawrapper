<?php

require_once '../lib/utils/themes.php';
require_once '../lib/utils/visualizations.php';

function nbChartsByMonth($user) {
    $con = Propel::getConnection();
    $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) c FROM chart WHERE author_id = ". $user->getId() ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY ym ORDER BY ym DESC ;";
    $rs = $con->query($sql);
    $res = array();
    foreach ($rs as $r) {
        $res[] = array('count' => $r['c'], 'id' => $r['ym'], 'name' => $r['ym']);
    }
    return $res;
}

function nbChartsByType($user) {
    $con = Propel::getConnection();
    $sql = "SELECT type, COUNT(*) c FROM chart WHERE author_id = ". $user->getId() ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY type ORDER BY c DESC ;";
    $rs = $con->query($sql);
    $res = array();

    foreach ($rs as $r) {
        $vis = get_visualization_meta($r['type']);
        $res[] = array('count' => $r['c'], 'id' => $r['type'], 'name' => $vis['title'][substr(DatawrapperSession::getLanguage(), 0, 2)]);
    }
    return $res;
}

function nbChartsByLayout($user) {
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

$app->get('/mycharts', function () use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $page = array(
            'charts' => ChartQuery::create()->getPublicChartsByUser($user),
            'bymonth' => nbChartsByMonth($user),
            'byvis' => nbChartsByType($user),
            'bylayout' => nbChartsByLayout($user)
        );

        add_header_vars($page, 'mycharts');
        $app->render('mycharts.twig', $page);
    } else {
        error_mycharts_need_login();
    }
});

$app->get('/mycharts/by/:key/:val', function ($key, $val) use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $page = array(
            'charts' => ChartQuery::create()->getPublicChartsByUser($user, $key, $val),
            'bymonth' => nbChartsByMonth($user),
            'byvis' => nbChartsByType($user),
            'bylayout' => nbChartsByLayout($user),
            'key' => $key,
            'val' => $val
        );

        add_header_vars($page, 'mycharts');
        $app->render('mycharts.twig', $page);
    } else {
        error_mycharts_need_login();
    }
});