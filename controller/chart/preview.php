<?php

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/(chart|map|table)/:id/preview/?', function ($id) use ($app) {
    $app->redirect("/preview/$id");
    disable_cache($app);
});

