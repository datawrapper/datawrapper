<?php

/* login user */
$app->post('/auth/login', function() {
    echo 'You are logged in now.';
});

/* return the server salt for secure auth */
$app->get('/auth/salt', function() use ($app) {
    $salt = 'uRPAqgUJqNuBdW62bmq3CLszRFkvq4RW';
    $app->render('json-ok.php', array($salt));
});