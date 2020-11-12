<?php

$app->map('/(chart|table)/create', function() use ($app) {
    disable_cache($app);

    $cfg = $GLOBALS['dw_config'];

    $user = DatawrapperSession::getUser();
    if (!$user->isLoggedIn() && isset($cfg['prevent_guest_charts']) && $cfg['prevent_guest_charts']) {
        error_access_denied();
    } else {
        $req = $app->request();
        if ($req->params('type') != null) {
            if (!DatawrapperVisualization::has($req->params('type'))) {
                return $app->redirect('/');
            }
        }
        $chart = ChartQuery::create()->createEmptyChart($user);
        $step = 'upload';
        if ($req->post('data') != null) {
            $chart->writeData($req->post('data'));
            $step = 'describe';
            if ($req->post('source-name') != null) {
                $chart->updateMetadata('describe.source-name', $req->post('source-name'));
                $step = 'visualize';
            }
            if ($req->post('source-url') != null) {
                $chart->updateMetadata('describe.source-url', $req->post('source-url'));
                $step = 'visualize';
            }
            if ($req->post('title') != null) {
                $chart->setTitle($req->post('title'));
            }
        }
        if ($req->params('type') != null) {
            $chart->setType($req->params('type'));
            $chart->updateMetadata('visualize.chart-type-set', true);
        }
        if ($req->post('basemap')) {
            $chart->updateMetadata('visualize.map-type-set', 'true');
            $chart->updateMetadata('visualize.basemap', $req->post('basemap'));
            $step = 'data';
        }
        if ($req->post('theme') != null) {
            if (ThemeQuery::findPk($req->post('theme')) !== false) {
                $chart->setTheme($req->post('theme'));
            }
        }
        if ($req->params('folder') != null) {
            $folder = FolderQuery::create()->findPk($req->params('folder'));
            if ($folder->isAccessibleBy($user)) {
                $chart->setInFolder($folder->getId());
                if ($folder->getType() == 'user') {
                    $chart->setOrganizationId(null);
                } else {
                    $chart->setOrganizationId($folder->getOrgId());
                }
            }
        }
        // copy entire chart from chart template
        if ($req->post('chart-template') != null) {
            // see if there's a chart with that id
            $chart_tpl = ChartQuery::create()->findPk($req->post('chart-template'));
            if ($chart_tpl) {
                // test if this chart is a valid chart template
                $chart_tpl_org = $chart_tpl->getOrganization();
                if ($chart_tpl_org && $chart_tpl_org->getSettings('chart-templates')) {
                    // test if chart has been published before
                    $public_tpl = $chart_tpl->getPublicChart();
                    if ($public_tpl) {
                        // copy data
                        $chart->writeData($public_tpl->loadData());
                        $chart->setExternalData($public_tpl->getExternalData());
                        // copy raw metadata from public chart
                        $chart->setRawMetadata($public_tpl->getMetadata());
                        // copy title, type
                        $chart->setTitle($public_tpl->getTitle());
                        $chart->setType($public_tpl->getType());

                        $user = DatawrapperSession::getUser();
                        if ($user->isLoggedIn()) {
                            try {
                                $chart->writeAsset($chart->getId() . ".map.json", $chart_tpl->loadAsset($chart_tpl->getId() . ".map.json"));
                            } catch (Exception $ex) {}
                        }

                        // set last step to visualize
                    } else {
                        // if not we use the last version in datawrapper as fallback
                        $chart->writeData($chart_tpl->loadData());
                        $chart->setRawMetadata($chart_tpl->getRawMetadata());
                        $chart->setTitle($chart_tpl->getTitle());
                        $chart->setType($chart_tpl->getType());
                    }
                    $chart->setForkedFrom($chart_tpl->getId());
                    $step = $chart->getDefaultStep().'?tpl='.$chart_tpl->getId();
                    $chart->setLastEditStep(3);
                    Action::logAction(Session::getUser(), 'chart-template', $chart_tpl->getId());
                }
            }
        }
        $chart->save();
        $app->redirect('/'.$chart->getNamespace().'/'.$chart->getId().'/'.$step);
    }
})->via('GET', 'POST');
