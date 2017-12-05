<?php

$app->map('/chart/create', function() use ($app) {
    disable_cache($app);

    $cfg = $GLOBALS['dw_config'];

    $user = DatawrapperSession::getUser();
    if (!$user->isLoggedIn() && isset($cfg['prevent_guest_charts']) && $cfg['prevent_guest_charts']) {
        error_access_denied();
    } else {
        $chart = ChartQuery::create()->createEmptyChart($user);
        $req = $app->request();
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
            if ($req->post('type') != null) {
                $chart->setType($req->post('type'));
            }
            if ($req->post('title') != null) {
                $chart->setTitle($req->post('title'));
            }
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
                    // copy data
                    $chart->writeData($chart_tpl->loadData());
                    // copy raw metadata
                    $chart->setRawMetadata($chart_tpl->getRawMetadata());
                    // copy title, type
                    $chart->setTitle($chart_tpl->getTitle());
                    $chart->setType($chart_tpl->getType());
                    $chart->setForkedFrom($chart_tpl->getId());
                    // set last step to visualize
                    $step = 'visualize';
                    $chart->setLastEditStep(3);
                    Action::logAction(DatawrapperSession::getUser(), 'chart-template', $chart_tpl->getId());
                }
            }
        }
        $chart->save();
        $app->redirect('/chart/'.$chart->getId().'/'.$step);
    }
})->via('GET', 'POST');
