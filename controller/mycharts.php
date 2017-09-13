<?php

function nbChartsByMonth($id, $is_org) {
    $where_clause = ($is_org) ? "organization_id = '".$id."'" : "author_id = '".$id."'";
    $con = Propel::getConnection();
    $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) c FROM chart WHERE ". $where_clause ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY ym ORDER BY ym DESC ;";
    $rs = $con->query($sql);
    $res = array();
    foreach ($rs as $r) {
        $res[] = array('count' => $r['c'], 'id' => $r['ym'], 'name' => strftime('%B %Y', strtotime($r['ym'].'-01')));
    }
    return $res;
}

function nbChartsByType($id, $is_org) {
    $where_clause = ($is_org) ? "organization_id = '".$id."'" : "author_id = '".$id."'";
    $con = Propel::getConnection();
    $sql = "SELECT type, COUNT(*) c FROM chart WHERE ". $where_clause ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY type ORDER BY c DESC ;";
    $rs = $con->query($sql);
    $res = array();

    foreach ($rs as $r) {
        $vis = DatawrapperVisualization::get($r['type']);
        $lang = substr(DatawrapperSession::getLanguage(), 0, 2);
        if (!isset($vis['title'])) continue;
        if (empty($vis['title'][$lang])) $lang = 'en';
        $res[] = array('count' => $r['c'], 'id' => $r['type'], 'name' => $vis['title']);
    }
    return $res;
}

/*function nbChartsByLayout($user) {
    $con = Propel::getConnection();
    $sql = "SELECT theme, COUNT(*) c FROM chart WHERE author_id = ". $user->getId() ." AND deleted = 0 AND last_edit_step >= 2 GROUP BY theme ORDER BY c DESC ;";
    $rs = $con->query($sql);
    $res = array();
    foreach ($rs as $r) {
        $theme = ThemeQuery::create()->findPk($r['theme']);
        if (!$theme) continue; // ignoring charts whose themes have been removed
        $res[] = array('count' => $r['c'], 'id' => $r['theme'], 'name' => $theme->getTitle());
    }
    return $res;
}*/

function nbChartsByStatus($id, $is_org) {
    if ($is_org) {
        $published = ChartQuery::create()->filterByOrganizationId($id)->filterByDeleted(false)->filterByLastEditStep(array('min'=>4))->count();
        $draft = ChartQuery::create()->filterByOrganizationId($id)->filterByDeleted(false)->filterByLastEditStep(3)->count();
    } else {
        $published = ChartQuery::create()->filterByAuthorId($id)->filterByDeleted(false)->filterByLastEditStep(array('min'=>4))->count();
        $draft = ChartQuery::create()->filterByAuthorId($id)->filterByDeleted(false)->filterByLastEditStep(3)->count();
    }
    return array(
        array('id'=>'published', 'name' => __('Published'), 'count' => $published),
        array('id'=>'draft', 'name' => __('Draft'), 'count' => $draft)
    );
}

function list_organizations($user) {
    $user_id = $user->getId();
    $organizations = UserOrganizationQuery::create()->findByUserId($user_id);
    $orgs = array();
    foreach ($organizations as $user_org) {
        $org = $user_org->getOrganization();
        if (!$org->getDisabled()) {
            $obj = new stdClass();
            $obj->id = $org->getId();
            $obj->name = $org->getName();
            $obj->tag = preg_replace(array('/[^[:alnum:] -]/', '/(\s+|\-+)/'), array('', '-'), $org->getId());
            $orgs[] = $obj;
        }
    }

    uasort($orgs, function($a, $b) {
        if ($a->name == $b->name) return 0;
        return ($a->name < $b->name) ? -1 : 1;
    });

    return $orgs;
}

/*
 * shows MyChart page for a given user (or organization), which is typically the
 * logged user, but admins can view others MyCharts page, too.
 */
function any_charts($app, $user, $folder_id = false, $org_id = false) {
    $curPage = $app->request()->params('page');
    $q = $app->request()->params('q');
    $key = $app->request()->params('key');
    $val = $app->request()->params('val');
    if (empty($curPage)) $curPage = 0;
    $perPage = 48;
    $filter = !(empty($key) || empty($val)) ? array($key => $val) : array();
    if ($folder_id !== false) $filter = array_merge($filter, array('folder' => $folder_id));
    if (!empty($q)) $filter['q'] = $q;
    if ($org_id) {
        $id = $org_id;
        $is_org = true;
    } else {
        $id = $user->getId();
        $is_org = false;
    }
    $charts =  ChartQuery::create()->getPublicChartsById($id, $is_org, $filter, $curPage * $perPage, $perPage, 'lastUpdated');
    $total = ChartQuery::create()->countPublicChartsById($id, $is_org, $filter);

    $page = array(
        'title' => __('My Charts'),
        'charts' => $charts,
        'bymonth' => nbChartsByMonth($id, $is_org),
        'byvis' => nbChartsByType($id, $is_org),
        'bystatus' => nbChartsByStatus($id, $is_org),
        'key' => $key,
        'val' => $val,
        'search_query' => empty($q) ? '' : $q,
        'mycharts_base' => '/mycharts',
        'organizations' => list_organizations($user),
        'preload' => FolderQuery::create()->getParsableFolders($user)
    );

    if (DatawrapperSession::getUser()->isAdmin() && $user != DatawrapperSession::getUser()) {
        $page['user2'] = $user;
        $page['mycharts_base'] = '/admin/charts/' . $user->getId();
        $page['all_users'] = UserQuery::create()->filterByDeleted(false)->orderByEmail()->find();
    }

    add_header_vars($page, 'mycharts');
    add_pagination_vars($page, $total, $curPage, $perPage, empty($q) ? '' : '&q='.$q);
    $app->render('mycharts.twig', $page);
}

/*
 * pitfall: folder_id = null → root folder
 * getting all user/organization charts via mycharts/organization is no longer possible
 */
$app->get('(/mycharts|/organization/:org_id)(/?|/:folder_id/?)', function ($org_id = false, $folder_id = null) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    if (!$user->isLoggedIn()) {
        error_mycharts_need_login();
        return;
    }
    if ($org_id && !$user->isMemberOf($org_id)) {
        error_mycharts_not_a_member();
        return;
    }
    any_charts($app, $user, $folder_id, $org_id);
});

$app->get('/admin/charts/:userid/?', function($userid) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        $user2 = UserQuery::create()->findOneById($userid);
        if ($user2) {
            any_charts($app, $user2);
        } else {
            error_mycharts_user_not_found();
        }
    } else {
        $app->notFound();
    }
});
