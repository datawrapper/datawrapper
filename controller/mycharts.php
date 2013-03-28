<?php

require_once '../lib/utils/themes.php';
require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/pagination.php';

function nbChartsByMonth($user) {
    $con = Propel::getConnection();
    $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) c FROM chart WHERE author_id = ". $user->getId() ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY ym ORDER BY ym DESC ;";
    $rs = $con->query($sql);
    $res = array();
    foreach ($rs as $r) {
        $res[] = array('count' => $r['c'], 'id' => $r['ym'], 'name' => strftime('%B %Y', strtotime($r['ym'].'-01')));
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
        $lang = substr(DatawrapperSession::getLanguage(), 0, 2);
        if (!isset($vis['title'])) continue;
        if (empty($vis['title'][$lang])) $lang = 'en';
        $res[] = array('count' => $r['c'], 'id' => $r['type'], 'name' => $vis['title'][$lang]);
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
        if (!$theme) continue; // ignoring charts whose themes have been removed
        $res[] = array('count' => $r['c'], 'id' => $r['theme'], 'name' => $theme['title']);
    }
    return $res;
}


/*
 * shows MyChart page for a given user, which is typically the
 * logged user, but admins can view others MyCharts page, too.
 */
function user_charts($app, $user, $key, $val) {
    $curPage = $app->request()->params('page');
    if (empty($curPage)) $curPage = 0;
    $perPage = 12;
    $filter = !empty($key) ? array($key => $val) : array();
    $charts =  ChartQuery::create()->getPublicChartsByUser($user, $filter, $curPage * $perPage, $perPage);
    $total = ChartQuery::create()->countPublicChartsByUser($user, $filter);

    $page = array(
        'charts' => $charts,
        'bymonth' => nbChartsByMonth($user),
        'byvis' => nbChartsByType($user),
        'bylayout' => nbChartsByLayout($user),
        'key' => $key,
        'val' => $val,
        'mycharts_base' => '/mycharts'
    );

    if (DatawrapperSession::getUser()->isAdmin() && $user != DatawrapperSession::getUser()) {
        $page['user2'] = $user;
        $page['mycharts_base'] = '/admin/charts/' . $user->getId();
        $page['all_users'] = UserQuery::create()->filterByDeleted(false)->orderByEmail()->find();
    }

    add_header_vars($page, 'mycharts');
    add_pagination_vars($page, $total, $curPage, $perPage);
    $app->render('mycharts.twig', $page);
}


$app->get('/mycharts(/?|/by/:key/:val)', function ($key = false, $val = false) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        user_charts($app, $user, $key, $val);
    } else {
        error_mycharts_need_login();
    }
});


$app->get('/admin/charts/:userid(/?|/by/:key/:val)', function($userid, $key = false, $val = false) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        $user2 = UserQuery::create()->findOneById($userid);
        if ($user2) {
            user_charts($app, $user2, $key, $val);
        } else {
            error_mycharts_user_not_found();
        }
    } else {
        $app->notFound();
    }
});

