<?php

require_once ROOT_PATH . 'lib/utils/check_iframe_origin.php';

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/(chart|map|table)/:id/preview/?', function ($id) use ($app) {
    $app->redirect("/preview/$id");
    disable_cache($app);
});

