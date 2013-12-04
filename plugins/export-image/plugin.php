<?php

class DatawrapperPlugin_ExportImage extends DatawrapperPlugin {

    public function init() {
        $plugin = $this;
        // hook into chart publication
        DatawrapperHooks::register(DatawrapperHooks::GET_CHART_ACTIONS, function() use ($plugin) {
            // no export possible without email
            $user = DatawrapperSession::getUser();
            if ($user->getEmail() == '') return array();
            return array(
                'id' => 'export-image',
                'title' => __("Export to static image for printing", $plugin->getName()),
                'icon' => 'print'
            );
        });

        // provide static assets files
        $this->declareAssets(
            array('export-image/export-image.js', 'export-image/export-image.css'),
            "|/chart/[^/]+/publish|"
        );

        // hook into job execution
        DatawrapperHooks::register('export_image',
            array($this, 'exportImage'));
    }

    public function exportImage($job) {
        // since this job is run outside of a session we need
        // to manually set the language to the one of the
        // user who created the job (otherwise the mail won't
        // be translated right)
        global $__l10n;
        $__l10n->loadMessages($job->getUser()->getLanguage());

        $chart = $job->getChart();

        $params = $job->getParameter();
        $format = $params['format'];
        $imgFile = ROOT_PATH . 'charts/exports/' . $chart->getId() . '-' . $params['ratio'] . '.' . $format;
        // execute hook provided by phantomjs plugin
        // this calls phantomjs with the provided arguments
        $res = DatawrapperHooks::execute(
            'phantomjs_exec',
            // path to the script
            ROOT_PATH . 'plugins/' . $this->getName() . '/export_chart.js',
            // 1) url of the chart
            'http://' . $GLOBALS['dw_config']['domain'] . '/chart/'. $chart->getId() .'/',
            // 2) path to the image
            $imgFile,
            // 3) output width
            $params['ratio']
        );
        if (empty($res[0])) {
            $job->setStatus('done');

            // now send email to the user who is waiting for the image!
            dw_send_mail_attachment(
                $job->getUser()->getEmail(),
                'noreply@'.$GLOBALS['dw_config']['domain'],
                __('The image of your chart is ready', $this->getName()),
                vksprintf(__('Hello,

Here is the requested static image of your chart "%title$s" on %domain$s.

All the best,
Datawrapper', $this->getName()), array(
                    'title' => $chart->getTitle(),
                    'domain' => $GLOBALS['dw_config']['domain']
                )),
                array(
                    basename($imgFile) => array(
                        'path' => $imgFile,
                        'format' => "image/$format"
                    )
                )
            );
        } else {
            // error message received, send log email
            dw_send_error_mail(
                sprintf('Image export of chart [%s] failed!', $chart->getId()),
                print_r($job->toArray()) . "\n\nError:\n" . $res[0]
            );
            $job->setStatus('failed');
            $job->setFailReason($res[0]);
        }
        $job->save();
    }

}
