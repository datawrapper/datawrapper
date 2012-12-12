<?php

$app->get('/admin-users/?', function() use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        $page = array(
            'title' => 'Datawrapper Admin',
        );
        add_header_vars($page, 'admin');
        $app->render('admin-users.twig', $page);
    } else {
        $app->notFound();
    }
});