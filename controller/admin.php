<?php

require_once '../lib/utils/themes.php';


function add_adminpage_vars(&$page, $active) {
    $page['adminmenu'] = array(
        '/admin' => 'Dashboard',
        '/admin/users' => 'Users',
        '/admin/themes' => 'Themes',
        '/admin/translations' => 'Translations',
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

        $metrics = array('users_signed', 'users_activated', 'charts_uploaded', 'charts_described', 'charts_visualized', 'charts_published');

        $con = Propel::getConnection();
        $data = array();

        foreach ($metrics as $metric) {
            $data[$metric] = array();
            $sql = 'SELECT MONTH(time) m, DAYOFMONTH(time) d, value FROM `stats` WHERE metric = "'.$metric.'" GROUP BY m, d ORDER BY `time`  DESC LIMIT 30';
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

        for ($ago = 30; $ago >= 0; $ago--) {
            $lbl = date('j/n', time() - $ago*86400);
            $user_csv .= $lbl.';';
            $user_csv .= isset($data['users_activated'][$lbl]) ? $data['users_activated'][$lbl] : '-';
            $user_csv .= ';';
            $user_csv .= isset($data['users_signed'][$lbl]) ? $data['users_signed'][$lbl] : '-';
            $user_csv .= "\\n";

            $chart_csv .= $lbl.';';
            // $chart_csv .= isset($data['charts_uploaded'][$lbl]) ? $data['charts_uploaded'][$lbl] : '-';
            // $chart_csv .= ';';
            // $chart_csv .= isset($data['charts_described'][$lbl]) ? $data['charts_described'][$lbl] : '-';
            // $chart_csv .= ';';
            $chart_csv .= isset($data['charts_visualized'][$lbl]) ? $data['charts_visualized'][$lbl] : '-';
            $chart_csv .= ';';
            $chart_csv .= isset($data['charts_published'][$lbl]) ? $data['charts_published'][$lbl] : '-';
            $chart_csv .= "\\n";
        }

        $page = array(
            'title' => 'Dashboard',
            'user_csv' => $user_csv,
            'chart_csv' => $chart_csv,
            'linechart' => get_visualization_meta('line-chart')
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
            'themes' => get_themes_meta(),
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
                ->join('User.Chart')
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



$app->get('/admin/translations', function() use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        // get untranslated strings from all the meta.jsons
        $missing = array();
        $messages = array();
        function msg($vis, $key, $o, $fallback = false) {
            $languages = array('de', 'fr', 'en', 'es');
            $msg = array('vis' => $vis, 'key' => $key);
            foreach ($languages as $lang) {
                if (isset($o[$lang])) $msg[$lang] = $o[$lang];
                else if ($lang == "en" && $fallback) $msg[$lang] = $fallback;
                else $msg[$lang] = '<span class="label label-warning">missing</span>';
            }
            return $msg;
        }
        $vis_path = ROOT_PATH . 'www/static/visualizations';
        $visMetaFiles = glob($vis_path . '/*/meta.json');
        foreach ($visMetaFiles as $file) {
            $meta = json_decode(file_get_contents($file), true);
            if (!isset($meta['title'])) continue;
            $vis = substr($file, strlen($vis_path)+1, -10);
            $messages[] = msg($vis, 'title', $meta['title']);
            foreach ($meta['options'] as $key => $opt) {
                if (isset($opt['label'])) {
                    $messages[] = msg($vis, $key, $opt['label']);
                }
            }
            if (isset($meta['locale'])) {
                foreach ($meta['locale'] as $key => $loc) {
                    $messages[] = msg($vis, $key, $loc, $key);
                }
            }
        }
        $page = array('title' => 'Translations', 'messages' => $messages);
        add_header_vars($page, 'admin');
        add_adminpage_vars($page, '/admin/translations');
        $app->render('admin-translations.twig', $page);
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