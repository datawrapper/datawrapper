<?php

class DatawrapperPlugin_ExportStaticPng extends DatawrapperPlugin {

    public function init() {
        // hook into chart publication
        DatawrapperHooks::register(DatawrapperHooks::POST_CHART_PUBLISH,
            array($this, 'triggerExportJob'));

        // hook into job execution
        DatawrapperHooks::register('export_static_chart',
            array($this, 'exportStaticPng'));
    }

    public function triggerExportJob($chart, $user) {
        // queue a job for thumbnail generation
        $params = array(
            'width' => $chart->getMetadata('publish.embed-width'),
            'height' => $chart->getMetadata('publish.embed-height')
        );
        $job = JobQuery::create()->createJob("export_static_chart", $chart, $user, $params);
    }

    public function exportStaticPng($job) {
        $chart = $job->getChart();
        $params = $job->getParameter();
        $static_path = ROOT_PATH . 'charts/static/' . $chart->getId() . '/';
        // execute hook provided by phantomjs plugin
        // this calls phantomjs with the provided arguments
        $res = DatawrapperHooks::execute(
            'phantomjs_exec',
            // path to the script
            ROOT_PATH . 'plugins/' . $this->getName() . '/gen_static_fallback.js',
            // url of the chart
            'http://' . $GLOBALS['dw_config']['domain'] . '/chart/'. $chart->getId() .'/',
            // path to the image
            $static_path,
            // output width
            $params['width'],
            // output height
            $params['height']
        );
        if (empty($res[0])) {
            $job->setStatus('done');
            // upload to CDN if possible
            DatawrapperHooks::execute(DatawrapperHooks::PUBLISH_FILES, array(
                array(
                    $static_path . 'static.html',
                    $chart->getId() . '/' . $chart->getPublicVersion() . '/static.html',
                    'text/html'
                ),
                array(
                    $static_path . 'static.png',
                    $chart->getId() . '/' . $chart->getPublicVersion() . '/static.png',
                    'image/png'
                ),
                array(
                    $static_path . 'nojs.png',
                    $chart->getId() . '/' . $chart->getPublicVersion() . '/nojs.png',
                    'image/png'
                )
            ));
        } else {
            // error message received, send log email
            dw_send_error_mail(
                sprintf('Generation of static fallback for chart [%s] failed', $chart->getId()),
                print_r($job->toArray()) .  "\n\nError:\n" . $res[0]
            );
            $job->setStatus('failed');
            $job->setFailReason($res[0]);
        }
        $job->save();
    }

}