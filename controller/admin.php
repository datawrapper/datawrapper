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

    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {

        $metrics = array('users_signed', 'users_activated', 'charts_visualized', 'charts_published');

        $con = Propel::getConnection();
        $data = array();

        foreach ($metrics as $metric) {
            $data[$metric] = array();
            $sql = 'SELECT MONTH(time) m, DAYOFMONTH(time) d, value FROM `stats` WHERE metric = "'.$metric.'" GROUP BY m, d ORDER BY `time` DESC LIMIT 90';
            $rs = $con->query($sql);
            $res = array();
            foreach ($rs as $r) {
                $lbl = $r['d'].'/'.$r['m'];
                $val = $r['value'];
                $data[$metric][$lbl] = $val;
            }
        }

        $user_csv = "Date;Activated;Signed\\n";
        $chart_csv = "Date;Visualized;Published\\n";

        for ($ago = 90; $ago >= 0; $ago--) {
            $key = date('j/n', time() - $ago*86400);
            $lbl = date('Y-m-d', time() - $ago*86400);
            $user_csv .= $lbl.';';
            $user_csv .= isset($data['users_activated'][$key]) ? $data['users_activated'][$key] : '-';
            $user_csv .= ';';
            $user_csv .= isset($data['users_signed'][$key]) ? $data['users_signed'][$key] : '-';
            $user_csv .= "\\n";

            $chart_csv .= $lbl.';';
            // $chart_csv .= isset($data['charts_uploaded'][$lbl]) ? $data['charts_uploaded'][$lbl] : '-';
            // $chart_csv .= ';';
            // $chart_csv .= isset($data['charts_described'][$lbl]) ? $data['charts_described'][$lbl] : '-';
            // $chart_csv .= ';';
            $chart_csv .= isset($data['charts_visualized'][$key]) ? $data['charts_visualized'][$key] : '-';
            $chart_csv .= ';';
            $chart_csv .= isset($data['charts_published'][$key]) ? $data['charts_published'][$key] : '-';
            $chart_csv .= "\\n";
        }

        $page = array(
            'title' => 'Dashboard',
            'user_csv' => $user_csv,
            'chart_csv' => $chart_csv,
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