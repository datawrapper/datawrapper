<?php

class DatawrapperPlugin_AdminJobs extends DatawrapperPlugin {

    public function init() {
        $plugin = $this;
        // register plugin controller
        DatawrapperHooks::register(
            DatawrapperHooks::GET_ADMIN_PAGES,
            function() use ($plugin) {
                // add badges to menu title
                $title = __('Jobs', $plugin->getName());
                $q = JobQuery::create()->filterByStatus('queued')->count();
                if ($q > 0) $title .= ' <span class="badge badge-info">'.$q.'</span>';
                $f = JobQuery::create()->filterByStatus('failed')->count();
                if ($f > 0) $title .= ' <span class="badge badge-important">'.$f.'</span>';
                return array(
                    'url' => '/jobs',
                    'title' => $title,
                    'controller' => array($plugin, 'jobsAdmin'),
                    'order' => '10'
                );
            }
        );
    }

    /*
     * controller for jobs admin
     */
    public function jobsAdmin($app, $page) {
        $jobs = JobQuery::create()->filterByStatus('failed')->orderById('desc')->find();
        $page = array_merge($page, array(
            'title' => 'Background Jobs',
            'jobs' => count($jobs) > 0 ? $jobs : false,
            'queued' => JobQuery::create()->filterByStatus('queued')->count(),
            'failed' => JobQuery::create()->filterByStatus('failed')->count(),
            'done' => JobQuery::create()->filterByStatus('done')->count()
        ));
        $page['est_time'] = ceil($page['queued'] * 2 / 60);

        $app->render('plugins/admin-jobs/admin-jobs.twig', $page);
    }

}