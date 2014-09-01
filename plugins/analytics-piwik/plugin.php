<?php

/**
 * Datawrapper Piwik Analytics Plugin
 *
 */

class DatawrapperPlugin_AnalyticsPiwik extends DatawrapperPlugin {

    public function init() {
        DatawrapperHooks::register(DatawrapperHooks::CHART_AFTER_BODY, array($this, 'getTrackingCode'));
        DatawrapperHooks::register(DatawrapperHooks::CORE_AFTER_BODY, array($this, 'getTrackingCode'));
    }

  	public function getTrackingCode($chart = null) {
        $config = $this->getConfig();
        if (empty($config)) return false;

        global $app;

        $app->render('plugins/analytics-piwik/piwik-code.twig', array(
            'url' => $config['url'],
            'idSite' => $config['idSite'],
            'chart' => $chart,
            'user' => is_null($chart) ? null : $chart->getUser()
        ));
        
    }

}
