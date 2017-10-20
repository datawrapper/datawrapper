<?php

function nbChartsByMonth($id, $is_org, $folder_id) {
    $id_clause = ($is_org) ? "organization_id = '".$id."'" : "organization_id is NULL AND author_id = '".$id."'";
    $folder_id = (!is_null($folder_id)) ? "= '".$folder_id."'" : 'is NULL';
    $con = Propel::getConnection();
    $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) c FROM chart WHERE ".$id_clause." AND in_folder ".$folder_id." AND deleted = 0 AND last_edit_step >= 2 GROUP BY ym ORDER BY ym DESC ;";
    $rs = $con->query($sql);
    $res = array();
    foreach ($rs as $r) {
        $res[] = array('count' => $r['c'], 'id' => $r['ym'], 'name' => strftime('%B %Y', strtotime($r['ym'].'-01')));
    }
    return $res;
}

function nbChartsByType($id, $is_org, $folder_id) {
    $id_clause = ($is_org) ? "organization_id = '".$id."'" : "organization_id is NULL AND author_id = '".$id."'";
    $folder_id = (!is_null($folder_id)) ? "= '".$folder_id."'" : 'is NULL';
    $con = Propel::getConnection();
    $sql = "SELECT type, COUNT(*) c FROM chart WHERE ".$id_clause." AND in_folder ".$folder_id." AND deleted = 0 AND last_edit_step >= 2 GROUP BY type ORDER BY c DESC ;";
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

function nbChartsByStatus($id, $is_org, $folder_id) {
    if ($is_org) {
        $published = ChartQuery::create()->filterByOrganizationId($id);
        $draft = ChartQuery::create()->filterByOrganizationId($id);
    } else {
        $published = ChartQuery::create()->filterByOrganizationId(null)->filterByAuthorId($id);
        $draft = ChartQuery::create()->filterByOrganizationId(null)->filterByAuthorId($id);
    }
    $published = $published->filterByDeleted(false)
        ->filterByLastEditStep(array('min'=>4))
        ->filterByInFolder($folder_id)
        ->count();
    $draft = $draft->filterByDeleted(false)
        ->filterByLastEditStep(3)
        ->filterByInFolder($folder_id)
        ->count();
    return array(
        array('id'=>'published', 'name' => __('Published'), 'count' => $published),
        array('id'=>'draft', 'name' => __('Draft'), 'count' => $draft)
    );
}

function mycharts_list_organizations($user) {
    $user_id = $user->getId();
    $organizations = $user->getOrganizations();
    $current_org = $user->getCurrentOrganization();
    if (!empty($current_org)) $current_org = $current_org->getId();
    $orgs = array();
    foreach ($organizations as $org) {
        if (!$org->getDisabled()) {
            $obj = new stdClass();
            $obj->id = $org->getId();
            $obj->name = $org->getName();
            $obj->tag = preg_replace(array('/[^[:alnum:] -]/', '/(\s+|\-+)/'), array('', '-'), $org->getId());
            $orgs[] = $obj;
        }
    }

    uasort($orgs, function($a, $b) use ($current_org) {
        if ($a->id == $current_org) return -1;
        if ($b->id == $current_org) return 1;
        if ($a->name == $b->name) return 0;
        return ($a->name < $b->name) ? -1 : 1;
    });

    return $orgs;
}

function mycharts_group_charts($charts_res, $groups) {
    // TODO: group charts
    $out = [];
    // convert Propel Collection to array
    $charts = [];
    foreach ($charts_res as $chart) { $charts[] = $chart; }

    foreach ($groups as $id => $group) {
        if (!isset($group['id'])) $group['id'] = $id;
        if (isset($group['filter'])) {
            $group['charts'] = array_filter($charts, $group['filter']);
            unset($group['filter']);
        }
        $out[] = $group;
    }
    return $out;
}

function mycharts_group_by_month($charts, $date='') {
    $groups = [];
    foreach ($charts as $chart) {
        switch ($date) {
            case 'created_at': $ym = $chart->getCreatedAt('Y-m'); break;
            case 'published_at': $ym = $chart->getPublishedAt('Y-m'); break;
            default: $ym = $chart->getLastModifiedAt('Y-m'); break;
        }
        $ts = strtotime($ym.'-01');
        $month = strftime('%B, %Y', $ts);
        if (!isset($groups[$month])) {
            $groups[$month] = [
                'title' => $month,
                'id' => $month,
                'charts' => []
            ];
        }
        $groups[$month]['charts'][] = $chart;
    }
    return $groups;
}

function mycharts_group_by_type($charts) {
    $groups = [];

    foreach ($charts as $chart) {
        $id = $chart->getType();
        if ($id == 'line-chart') $id = 'd3-lines';
        if ($id == 'bar-chart') $id = 'd3-bars';
        $type = DatawrapperVisualization::get($id)['title'];
        if (empty($type)) continue;
        if (!isset($groups[$type])) {
            $groups[$type] = [
                'title' => $type,
                'id' => $id,
                'charts' => []
            ];
        }
        $groups[$type]['charts'][] = $chart;
    }
    // sort groups by type name
    ksort($groups);
    return $groups;
}

function mycharts_group_by_author($charts) {
    $groups = [];

    foreach ($charts as $chart) {
        $user = $chart->getUser();
        $name = $user->guessName();
        if (!isset($groups[$name])) {
            $groups[$name] = [
                'title' => $name,
                'id' => $user->getId(),
                'charts' => []
            ];
        }
        $groups[$name]['charts'][] = $chart;
    }
    // sort groups by type name
    ksort($groups);
    return $groups;
}

function mycharts_group_by_folder($charts, $user) {
    $groups = [];
    $folder_lookup = [];
    $folder_link = [];
    foreach (FolderQuery::create()->getUserFolders($user) as $group) {
        foreach ($group['folders'] as $folder) {
            $folder_lookup[$folder->getId()] = $folder;
            $folder_link[$folder->getId()] = ($group['type'] == 'user' ? '/mycharts/' : '/organization/'.$group['organization']->getId().'/') . $folder->getId(); 
        }
    };
    $folder_paths = [];
    foreach ($folder_lookup as $id => $folder) {
        $path = $folder->getFolderName();
        $pid = $folder->getParentId();
        $known_ids = [];
        $max_depth = 100;
        while (!empty($pid) && $max_depth-- > 0) {
            $folder = $folder_lookup[$pid];
            $path = $folder->getFolderName() .' / '.$path;
            $pid = $folder->getParentId();
            if ($pid == $folder->getId()) {
                $GLOBALS['dw_alert'] = 'Folder DB Error: Folder '.$pid.' has itself set as parent folder';
                break;
            }
            if (in_array($pid, $known_ids)) {
                $GLOBALS['dw_alert'] = 'Folder DB Error: The folder tree is not a tree but a cyclic graph (check id '.$pid.')!';
                break;
            }
            $known_ids[] = $folder->getId();
        }
        if ($max_depth < 1) {
            $GLOBALS['dw_alert'] = 'Maximum folder depth reached, likely a bug in the folder table!';
        }
        $folder_paths[$id] = $path;
    }
    $org_lookup = [];
    foreach ($user->getOrganizations() as $org) {
        $org_lookup[$org->getId()] = $org->getName();
    }

    foreach ($charts as $chart) {
        $org_id = $chart->getOrganizationId();
        if (empty($org_id)) $parent = 'MyCharts';
        else $parent = $org_lookup[$org_id];
        $folder = $chart->getInFolder();
        $path = $parent;
        if (!empty($folder)) {
            $path .= ' / '.$folder_paths[$folder];
        }
        if (!isset($groups[$path])) {
            $groups[$path] = [
                'title' => $path,
                'id' => $folder,
                'link' => empty($folder) ? (empty($org_id) ? '/mycharts/': '/organization/'.$org_id.'/') : $folder_link[$folder],
                'charts' => []
            ];
        }
        $groups[$path]['charts'][] = $chart;
    }
    ksort($groups);
    return $groups;
}

function prepare_short_arrays($charts) {
    $shorty = [];

    foreach ($charts as $chart) {
        $flat = $chart->shortArray();
        $shorty[$flat['id']] = $flat;
        unset($shorty[$flat['id']]['id']);
    }

    return $shorty;
}

function mycharts_get_user_charts(&$page, $app, $user, $folder_id = false, $org_id = false, $query = false) {
    $curPage = $app->request()->params('page');
    $q = $app->request()->params('q');
    $key = $app->request()->params('key');
    $val = $app->request()->params('val');
    if (empty($curPage)) $curPage = 0;
    $perPage = 148;
    $filter = !(empty($key) || empty($val)) ? array($key => $val) : array();
    if ($folder_id !== false) $filter = array_merge($filter, array('folder' => $folder_id));
    if (!empty($q)) {
        unset($filter['folder']);
        $filter['q'] = $q;
    }

    if ($org_id && empty($filter['q'])) {
        $id = $org_id;
        $is_org = true;
    } else {
        $id = $user->getId();
        $is_org = false;
    }

    // get list of charts
    $sort_by = $app->request()->params('sort');
    $charts =  ChartQuery::create()->getPublicChartsById($id, $is_org, $filter, $curPage * $perPage, $perPage, $sort_by);
    $total = ChartQuery::create()->countPublicChartsById($id, $is_org, $filter);

    if (!empty($filter['q'])) {
        $grouped = mycharts_group_charts($charts, mycharts_group_by_folder($charts, $user));
    } else if (($sort_by == 'modified_at' || empty($sort_by)) && $total > 40) {
        $grouped = mycharts_group_charts($charts, mycharts_group_by_month($charts));
    } else if (($sort_by == 'created_at' || $sort_by == 'published_at') && $total > 40) {
        $grouped = mycharts_group_charts($charts, mycharts_group_by_month($charts, $sort_by));
    } else if ($sort_by == 'type') {
        $grouped = mycharts_group_charts($charts, mycharts_group_by_type($charts));
    } else if ($sort_by == 'status') {
        $grouped = mycharts_group_charts($charts, [
            'published' => [
                'title' => __('published'),
                'filter' => function($chart) { return $chart->getLastEditStep() > 3; }
            ],
            'draft' => [
                'title' => __('drafts'),
                'filter' => function($chart) { return $chart->getLastEditStep() == 3; }
            ],
            'just-data' => [
                'title' => __('just data'),
                'filter' => function($chart) { return $chart->getLastEditStep() <= 2; }
            ],
        ]);
    } else if ($sort_by == 'author') {
        $grouped = mycharts_group_charts($charts, mycharts_group_by_author($charts));
    } else {
        $grouped = mycharts_group_charts($charts, [
            'all' => [
                'title' => '',
                'filter' => function() { return true; }
            ]
        ]);
    }

    // save result to page
    $page['charts'] = prepare_short_arrays($charts);
    $page['num_charts'] = count($charts);
    $page['chart_groups'] = $grouped;
    add_pagination_vars($page, $total, $curPage, $perPage, empty($q) ? '' : '&q='.$q);
}

/*
 * shows MyChart page for a given user (or organization), which is typically the
 * logged user, but admins can view others MyCharts page, too.
 */
function any_charts($app, $user, $folder_id = false, $org_id = false) {

    $is_xhr = !empty($app->request()->params('xhr'));
    $q = $app->request()->params('q');

    if ($is_xhr) {
        $page = [
        ];
    } else {
        $folders = FolderQuery::create()->getParsableFolders($user);
        $hasFolders = false;
        foreach ($folders as $group) {
            if (count($group['folders']) > 0) {
                $hasFolders = true;
                break;
            }
        }
        $page = [
            'title' => __('My Charts'),
            'pageClass' => 'dw-mycharts',
            'search_query' => empty($q) ? '' : $q,
            'mycharts_base' => '/mycharts',
            'organizations' => mycharts_list_organizations($user),
            'preload' => $folders,
            'hasFolders' => $hasFolders
        ];
    }

    $con = Propel::getConnection();
    $sql = "SELECT organization_role FROM user_organization WHERE user_id = ".$con->quote($user->getId())." AND organization_id = ".$con->quote($org_id).";";

    $page['current'] = [
        'folder' => $folder_id,
        'organization' => $org_id,
        'organization_role' => !empty($org_id) ? $con->query($sql)->fetch()['organization_role'] : null,
        'sort' => $app->request()->params('sort'),
    ];

    mycharts_get_user_charts($page, $app, $user, $folder_id, $org_id);

    if (!$is_xhr && (DatawrapperSession::getUser()->isAdmin() && $user != DatawrapperSession::getUser())) {
        $page['user2'] = $user;
        $page['mycharts_base'] = '/admin/charts/' . $user->getId();
        $page['all_users'] = UserQuery::create()->filterByDeleted(false)->orderByEmail()->find();
    }

    add_header_vars($page, 'mycharts');
    $app->render(!$is_xhr ? 'mycharts.twig' : 'mycharts/chart-list.twig', $page);
}

/*
 * pitfall: folder_id = null → root folder
 * getting all user/organization charts via mycharts/organization is no longer possible
 */
$app->get('/(search|(mycharts|team/:org_id)(/:folder_id)?)/?', function ($org_id = false, $folder_id = null) use ($app) {
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
})->conditions(array('folder_id' => '\d+'));


$app->get('/organization/:org_id(/charts)?', function($org_id) use ($app) {
    $app->redirect('/team/'.$org_id.'/');
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
})->conditions(array('userid' => '\d+'));

