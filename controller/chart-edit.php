<?php

// redirects to the last edited step of the chart editor (todo)
$app->get('/charts/:id/edit', function($chartid) use ($app) {
    $app->redirect('/chart/'.$chartid.'/upload');
});