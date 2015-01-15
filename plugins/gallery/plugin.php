<?php

class DatawrapperPlugin_Gallery extends DatawrapperPlugin {

    public function init() {
        // register plugin controller under /gallery/
        $this->registerController($this, 'controller');

        // show link 'show in gallery'
        DatawrapperHooks::register(
            DatawrapperHooks::PUBLISH_AFTER_CHART_ACTIONS,
            function() {
                global $app;
                $app->render('plugins/gallery/show-in-gallery.twig');
            }
        );

        // show link to gallery in mycharts page
        DatawrapperHooks::register(
            DatawrapperHooks::MYCHARTS_AFTER_SIDEBAR,
            function($chart, $user) {
                global $app;
                $app->render('plugins/gallery/take-a-look.twig');
            }
        );

        if (!DatawrapperSession::getUser()->isLoggedIn()) {
            $this->addHeaderNav('mycharts', array(
                'url' => '/gallery/',
                'id' => 'gallery',
                'title' => __('Gallery'),
                'icon' => 'signal'
            ));
        }
    }

    public function controller($app) {
        $plugin = $this;
        $app->get('/gallery(/?|/by/:key/:val)', function ($key = false, $val = false) use ($app, $plugin) {
            disable_cache($app);

            $user = DatawrapperSession::getUser();
            $curPage = $app->request()->params('page');
            if (empty($curPage)) $curPage = 0;
            $perPage = 12;
            $filter = !empty($key) ? array($key => $val) : array();

            try {
                $charts =  ChartQuery::create()->getGalleryCharts($filter, $curPage * $perPage, $perPage);
                $total = ChartQuery::create()->countGalleryCharts($filter);
            }
            catch (Exception $e) {
                // make sure bogus input for the filter doesn't kill the site
                $charts = array();
                $total = 0;
            }

            $page = array(
                'charts' => $charts,
                'bymonth' => $plugin->nbChartsByMonth(),
                'byvis' => $plugin->nbChartsByType(),
                'key' => $key,
                'val' => $val
            );
            add_pagination_vars($page, $total, $curPage, $perPage);
            add_header_vars($page, 'gallery');
            $app->render('plugins/' . $plugin->getName() . '/gallery.twig', $page);
        });
    }

    public function nbChartsByMonth() {
        $con = Propel::getConnection();
        $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) c FROM chart WHERE show_in_gallery = 1 AND last_edit_step >= 5 and deleted = 0 GROUP BY ym ORDER BY ym DESC ;";
        $rs = $con->query($sql);
        $res = array();
        $max = 0;
        foreach ($rs as $r) {
            $res[] = array('count' => $r['c'], 'id' => $r['ym'], 'name' => strftime('%B %Y', strtotime($r['ym'].'-01')));
            $max = max($max, $r['c']);
        }
        foreach ($res as $c => $r) {
            $res[$c]['bar'] = round($r['count'] / $max * 80);
        }
        return $res;
    }

    public function nbChartsByType() {
        $con = Propel::getConnection();
        $sql = "SELECT type, COUNT(*) c FROM chart WHERE show_in_gallery = 1 AND last_edit_step >= 5 and deleted = 0 GROUP BY type ORDER BY c DESC ;";
        $rs = $con->query($sql);
        $res = array();

        $max = 0;
        foreach ($rs as $r) {
            $vis = DatawrapperVisualization::get($r['type']);
            $lang = substr(DatawrapperSession::getLanguage(), 0, 2);
            $res[] = array('count' => $r['c'], 'id' => $r['type'], 'name' => $vis['title']);
            $max = max($max, $r['c']);
        }
        foreach ($res as $c => $r) {
            $res[$c]['bar'] = round($r['count'] / $max * 80);
        }
        return $res;
    }

}
