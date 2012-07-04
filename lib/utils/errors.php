<?php

/**
 *
 */
function error_page($step, $title, $message) {
    global $app;
    $tmpl = array(
        'title' => $title,
        'message' => $message
    );
    add_header_vars($tmpl);
    $app->render('error.twig', $tmpl);
}

function error_chart_not_published() {
    error_page('create',
        _('Hold on!'),
        _('Sorry, but it seems that the chart you want to see is not quite ready for the world, yet. Why don\'t you just relax and wait a minute?')
    );
}

function error_not_allowed_to_publish() {
    error_page('create',
        _('Whoops! You\'re not allowed to publish charts, yet'),
        _('Sorry, but it seems that your account is not ready to publish charts, yet. If you created the chart as a guest, you should <a href="#login">sign up for a free account</a> now. In case you already did that, you probably still need to activate you e-mail address by clicking on that activation link we sent you.')
    );
}


function error_chart_not_found($id) {
    error_page('create',
        _('Whoops! We couldn\'t find that chart..'),
        _('Sorry, but it seems that there is no chart with the id <b>'.$id.'</b> (anymore)')
    );
}

function error_chart_not_writable() {
    error_page('create',
        _('Whoops! That charts doesn\'t belong to you'),
        _('Sorry, but the requested chart belongs to someone else.')
    );
}

function error_mycharts_need_login() {
    error_page('mycharts',
        _('Whoops! You need to be logged in.'),
        _('Good news is, sign up is free and takes less than 20 seconds.')
    );
}

