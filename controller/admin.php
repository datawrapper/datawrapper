<?php

require_once '../lib/utils/themes.php';


function add_adminpage_vars(&$page, $active) {
    $page['adminmenu'] = array();
    global $__dw_admin_pages;
    foreach ($__dw_admin_pages as $admin_page) {
        $page['adminmenu'][$admin_page['url']] = $admin_page['title'];
    }
    /*$page['adminmenu'] = array(
        '/admin' => 'Dashboard',
        '/admin/users' => 'Users',
        '/admin/themes' => 'Themes',
        '/admin/jobs' => 'Jobs',
    );*/
    /*$q = JobQuery::create()->filterByStatus('queued')->count();
    if ($q > 0) $page['adminmenu']['/admin/jobs'] .= ' <span class="badge badge-info">'.$q.'</span>';
    $f = JobQuery::create()->filterByStatus('failed')->count();
    if ($f > 0) $page['adminmenu']['/admin/jobs'] .= ' <span class="badge badge-important">'.$f.'</span>';*/
    $page['adminactive'] = $active;
}

$__dw_admin_pages = DatawrapperHooks::execute(DatawrapperHooks::GET_ADMIN_PAGES);
  // order by index "order"
usort($__dw_admin_pages, function($a, $b) {
    return (isset($a['order']) ? $a['order'] : 9999) - (isset($b['order']) ? $b['order'] : 9999);
});

foreach ($__dw_admin_pages as $admin_page) {
    $app->get('/admin' . $admin_page['url'], function() use ($app, $admin_page) {
        disable_cache($app);
        $user = DatawrapperSession::getUser();
        if ($user->isAdmin()) {
            $page_vars = array('title' => $admin_page['title']);
            add_header_vars($page_vars, 'admin');
            add_adminpage_vars($page_vars, $admin_page['url']);
            call_user_func_array($admin_page['controller'], array($app, $page_vars));
        } else {
            $app->notFound();
        }
    });
}



$app->get('/admin/themes/?', function() use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        $page = array(
            'title' => 'Themes',
            'themes' => DatawrapperTheme::all(),
            'count' => count_charts_per_themes()
        );
        add_header_vars($page, 'admin');
        add_adminpage_vars($page, '/admin/themes');
        $app->render('admin-themes.twig', $page);
    } else {
        $app->notFound();
    }
});


$app->get('/admin/users/?', function() use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        $page = array(
            'title' => 'Users',
            'q' => $app->request()->params('q', '')
        );
        add_header_vars($page, 'admin');
        add_adminpage_vars($page, '/admin/users');
        $sort = $app->request()->params('sort', '');
        function getQuery($user) {
            global $app;
            $sort = $app->request()->params('sort', '');
            $query = UserQuery::create()
                ->leftJoin('User.Chart')
                ->withColumn('COUNT(Chart.Id)', 'NbCharts')
                ->groupBy('User.Id')
                ->filterByDeleted(false);
            if ($app->request()->params('q')) {
                $query->filterByEmail('%' . $app->request()->params('q') . '%');
            }
            if (!$user->isSysAdmin()) {
                $query->filterByRole('sysadmin', Criteria::NOT_EQUAL);
            }
            switch ($sort) {
                case 'email': $query->orderByEmail('asc'); break;
                case 'charts': $query->orderBy('NbCharts', 'desc'); break;
            }
            return $query;
        }
        $curPage = $app->request()->params('page', 0);
        $total = getQuery($user)->count();
        $perPage = 50;
        $append = '';
        if ($page['q']) {
            $append = '&q=' . $page['q'];
        }
        if (!empty($sort)) {
            $append .= '&sort='.$sort;
        }
        add_pagination_vars($page, $total, $curPage, $perPage, $append);
        $page['users'] = getQuery($user)->limit($perPage)->offset($curPage * $perPage)->find();
        $app->render('admin-users.twig', $page);
    } else {
        $app->notFound();
    }
});


$app->get('/admin/jobs', function() use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        // get untranslated strings from all the meta.jsons
        $jobs = JobQuery::create()->filterByStatus('failed')->orderById('desc')->find();
        $page = array(
            'title' => 'Background Jobs',
            'jobs' => count($jobs) > 0 ? $jobs : false,
            'queued' => JobQuery::create()->filterByStatus('queued')->count(),
            'failed' => JobQuery::create()->filterByStatus('failed')->count(),
            'done' => JobQuery::create()->filterByStatus('done')->count(),
        );
        $page['est_time'] = ceil($page['queued'] * 2 / 60);
        add_header_vars($page, 'admin');
        add_adminpage_vars($page, '/admin/jobs');
        $app->render('admin-jobs.twig', $page);
    } else {
        $app->notFound();
    }
});