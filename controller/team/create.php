<?php

global $app;

$app->get('/team/new/setup', function() {
	global $app;

    if (DatawrapperSession::isLoggedIn()) {
        disable_cache($app);

        $page = array();
        add_header_vars($page);

        $app->render('team/create.twig', $page);
    } else {
        error_access_denied();
    }
});