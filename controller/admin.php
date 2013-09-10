<?php

require_once '../lib/utils/themes.php';


function add_adminpage_vars(&$page, $active) {
    $page['adminmenu'] = array(
        '/admin' => 'Dashboard',
        '/admin/users' => 'Users',
        '/admin/themes' => 'Themes',
        '/admin/jobs' => 'Jobs',
    );
    $q = JobQuery::create()->filterByStatus('queued')->count();
    if ($q > 0) $page['adminmenu']['/admin/jobs'] .= ' <span class="badge badge-info">'.$q.'</span>';
    $f = JobQuery::create()->filterByStatus('failed')->count();
    if ($f > 0) $page['adminmenu']['/admin/jobs'] .= ' <span class="badge badge-important">'.$f.'</span>';
    $page['adminactive'] = $active;
}


$app->get('/admin/?', function() use ($app) {
    disable_cache($app);

    // returns a CSV from a MySQL resultset
    function res2csv($rs) {
        $csv = "";
        $keys = array();
        $results = array();
        foreach ($rs as $r) {
            if (count($keys) == 0) {
                foreach ($r as $key => $val) {
                    if (is_string($key)) $keys[] = $key;
                }
                $csv = implode(";", $keys)."\\n";
            }
            $results[] = $r;
        }
        $results = array_reverse($results);
        foreach ($results as $r) {
            $values = array();
            foreach ($keys as $key) {
                $values[] = $r[$key];
            }
            $csv .=  implode(";", $values)."\\n";
        }
        return $csv;
    }

    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {

        $con = Propel::getConnection();
        $data = array();

        $publised_sql = 'SELECT DATE_FORMAT(published_at, \'%Y-%m-%d\') pub_date, COUNT(*) pub_count FROM `chart` WHERE last_edit_step = 5 GROUP BY pub_date ORDER BY `pub_date` DESC LIMIT 90';

        $created_sql = 'SELECT DATE_FORMAT(created_at, \'%Y-%m-%d\') pub_date, COUNT(*) pub_count FROM `chart` GROUP BY pub_date ORDER BY `pub_date` DESC LIMIT 90';

        $user_signups_sql = 'SELECT DATE_FORMAT(created_at, \'%Y-%m-%d\') create_date, COUNT(*) user_count FROM `user` GROUP BY create_date ORDER BY `create_date` DESC LIMIT 90';

        $page = array(
            'title' => 'Dashboard',
            'num_users' => UserQuery::create()->filterByDeleted(false)->count(),
            'num_users_activated' => UserQuery::create()->filterByDeleted(false)->filterByRole(UserPeer::ROLE_EDITOR)->count(),
            'num_charts' => ChartQuery::create()->filterByDeleted(false)->count(),
            'num_charts_published' => ChartQuery::create()->filterByLastEditStep(5)->filterByDeleted(false)->count(),
            'published_csv' => res2csv($con->query($publised_sql)),
            'created_csv' => res2csv($con->query($created_sql)),
            'user_signups_csv' => res2csv($con->query($user_signups_sql)),
            'linechart' => DatawrapperVisualization::get('line-chart'),
            'chartLocale' => 'en-US'
        );
        add_header_vars($page, 'admin');
        add_adminpage_vars($page, '/admin');
        $app->render('admin-dashboard.twig', $page);
    } else {
        $app->notFound();
    }
});




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