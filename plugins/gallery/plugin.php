<?php

class DatawrapperPlugin_Gallery extends DatawrapperPlugin {

    public function init() {

        DatawrapperHooks::register(
            DatawrapperHooks::GET_PLUGIN_CONTROLLER,
            array($this, 'controller')
        );

    }

    public function controller($app) {
        $plugin = $this;
        $app->get('/gallery2(/?|/by/:key/:val)', function ($key = false, $val = false) use ($app, $plugin) {
            disable_cache($app);

            $user = DatawrapperSession::getUser();
            $curPage = $app->request()->params('page');
            if (empty($curPage)) $curPage = 0;
            $perPage = 12;
            $filter = !empty($key) ? array($key => $val) : array();

            $charts =  ChartQuery::create()->getGalleryCharts($filter, $curPage * $perPage, $perPage);
            $total = ChartQuery::create()->countGalleryCharts($filter);

            $page = array(
                'charts' => $charts,
                'bymonth' => gal_nbChartsByMonth(),
                'byvis' => gal_nbChartsByType(),
                'key' => $key,
                'val' => $val
            );
            add_pagination_vars($page, $total, $curPage, $perPage);
            add_header_vars($page, 'gallery');
            $app->render('plugins/' . $plugin->getName() . '/gallery.twig', $page);
        });
    }

}