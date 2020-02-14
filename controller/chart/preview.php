<?php

require_once ROOT_PATH . 'lib/utils/check_iframe_origin.php';

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/(chart|map|table)/:id/preview', function ($id) use ($app) {
    $app->redirect("/preview/$id");
    disable_cache($app);

    /* check_chart_writable($id, function($user, $chart) use ($app) {
        if ($chart->getLanguage() != '') {
            global $__l10n;
            $__l10n->loadMessages($chart->getLanguage());
        }

        if ($app->request()->get('mode') == "print") $chart->usePrint();

        $theme = (empty($app->request()->get('theme')) ? $chart->getTheme() : $app->request()->get('theme'));
        $theme = ThemeQuery::create()->findPk($theme);
        if (empty($theme)) $theme = ThemeQuery::create()->findPk("default");
        $page['theme'] = $theme;

        $page = get_chart_content($chart, $user, $theme, $app->request()->get('minify'), $app->request()->get('debug'));
        $page['nopointer'] = $app->request()->get('nopointer') == 1;
        $page['plain'] = $app->request()->get('plain') == 1;
        $page['fullscreen'] = $app->request()->get('fs') == 1;
        $page['innersvg'] = $app->request()->get('innersvg') == 1;
        $page['config'] = $GLOBALS['dw_config'];
        $page['preview'] = $app->request()->get('minify') != 1;
        $page['assetDomain'] = get_chart_asset_domain($chart);

        check_iframe_origin($app);

        $app->render('chart.twig', $page);
    }); */
});

$app->get('/chart/:id/nojs.png', function ($id) use ($app) {
    $app->redirect('/static/img/nojs.png');
});

// always redirect to url without trailing slash
$app->get('/chart/:id/preview/', function ($id) use ($app) {
    $app->redirect("/preview/$id");
});

// static route to emulate published vis files
$app->get('/(chart|map|table)/:id/_static/:file+', function($id, $parts) use ($app) {
    check_chart_readable($id, function($user, $chart) use ($app, $parts) {
        $fn = implode('/', $parts);
        $vis = DatawrapperVisualization::get($chart->getType());
        if (file_exists(ROOT_PATH . 'www/' . $vis['__static_path'] . $fn)) {
            $app->redirect($vis['__static_path'] . $fn);
        } else {
            $app->notFound();
        }
    });
});
