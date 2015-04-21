<?php

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/chart/:id/preview', function ($id) use ($app) {
    disable_cache($app);

    check_chart_readable($id, function($user, $chart) use ($app) {
        if ($chart->getLanguage() != '') {
            global $__l10n;
            $__l10n->loadMessages($chart->getLanguage());
        }
        $page = get_chart_content($chart, $user, $app->request()->get('minify'), $app->request()->get('debug'));
        $page['plain'] = $app->request()->get('plain') == 1;
        $page['fullscreen'] = $app->request()->get('fs') == 1;
        $page['innersvg'] = $app->request()->get('innersvg') == 1;

        if (!empty($GLOBALS['dw_config']['prevent_chart_preview_in_iframes'])) {
            // prevent this url from being rendered in iframes on different
            // domains, mainly to protect server resources
            $res = $app->response();
            $res['X-Frame-Options'] = 'SAMEORIGIN';
        }

        $app->render('chart.twig', $page);
    });
});

$app->get('/chart/:id/nojs.png', function ($id) use ($app) {
    $app->redirect('/static/img/nojs.png');
});

// always redirect to url without trailing slash
$app->get('/chart/:id/preview/', function ($id) use ($app) {
    $app->redirect("/chart/$id/preview");
});

// static route to emulate published vis files
$app->get('/chart/:id/_static/:file+', function($id, $parts) use ($app) {
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