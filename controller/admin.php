<?php

$app->get('/admin/?', function() use ($app) {
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
        $chart_csv = "Date;Uploaded;Described;Visualized;Published\\n";

        for ($ago = 30; $ago >= 0; $ago--) {
            $lbl = date('j/n', time() - $ago*86400);
            $user_csv .= $lbl.';';
            $user_csv .= isset($data['users_activated'][$lbl]) ? $data['users_activated'][$lbl] : '-';
            $user_csv .= ';';
            $user_csv .= isset($data['users_signed'][$lbl]) ? $data['users_signed'][$lbl] : '-';
            $user_csv .= "\\n";

            $chart_csv .= $lbl.';';
            $chart_csv .= isset($data['charts_uploaded'][$lbl]) ? $data['charts_uploaded'][$lbl] : '-';
            $chart_csv .= ';';
            $chart_csv .= isset($data['charts_described'][$lbl]) ? $data['charts_described'][$lbl] : '-';
            $chart_csv .= ';';
            $chart_csv .= isset($data['charts_visualized'][$lbl]) ? $data['charts_visualized'][$lbl] : '-';
            $chart_csv .= ';';
            $chart_csv .= isset($data['charts_published'][$lbl]) ? $data['charts_published'][$lbl] : '-';
            $chart_csv .= "\\n";
        }

        $page = array(
            'title' => 'Datawrapper Admin',
            'user_csv' => $user_csv,
            'chart_csv' => $chart_csv
        );
        add_header_vars($page, 'admin');
        $app->render('admin.twig', $page);
    } else {
        $app->notFound();
    }
});