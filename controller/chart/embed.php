<?php

require_once ROOT_PATH . 'lib/utils/check_iframe_origin.php';

/*
 * Main controller for chart rendering
 */
$app->get('/chart/:id/', function ($id) use ($app) {
    disable_cache($app);


    check_chart_public($id, function($user, $chart) use ($app) {
        if ($chart->getLanguage() != '') {
            global $__l10n;
            $__l10n->loadMessages($chart->getLanguage());
        }

        $theme = (empty($app->request()->get('theme')) ? $chart->getTheme() : $app->request()->get('theme'));
        $theme = ThemeQuery::create()->findPk($theme);
        if (empty($theme)) $theme = ThemeQuery::create()->findPk("default");
        $page['theme'] = $theme;

        // copy attributes from last published version
        $publicChart = $chart->getPublicChart();

        if ($publicChart) {
            $chart->setType($publicChart->getType());
            $chart->setExternalData($publicChart->getExternalData());
            $chart->setTitle($publicChart->getTitle());
            $chart->setRawMetadata($publicChart->getMetadata());
        }

        $page = get_chart_content($chart, $user, $theme, $app->request()->get('minify'), $app->request()->get('debug'));
        $page['thumb'] = $app->request()->params('t') == 1;
        $page['innersvg'] = $app->request()->get('innersvg') == 1;
        $page['plain'] = $app->request()->get('plain') == 1;
        $page['nopointer'] = $app->request()->get('nopointer') == 1;
        $page['fullscreen'] = $app->request()->get('fs') == 1;
        $page['assetDomain'] = get_chart_asset_domain($chart);

        check_iframe_origin($app);

        $app->render('chart.twig', $page);
    });
});

$app->get('/chart/:id', function($id) use ($app) {
    $app->redirect('/chart/' . $id . '/');
});
