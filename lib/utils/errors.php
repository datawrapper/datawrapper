<?php

/**
 *
 */
function error_page($step, $title, $message, $options = false, $status = 500) {
    global $app;
    $tmpl = array(
        'title' => $title,
        'message' => $message,
        'options' => $options,

    );
    $app->status($status);
    add_header_vars($tmpl, $step);
    $app->render('error.twig', $tmpl);
}

function error_not_found() {
    error_page('',
        __('404 - Page not found'),
        __('The page you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly. If all else fails, you can visit our home page at the link below.')
    );
}

function error_chart_not_published() {
    error_page('chart',
        __('Hold on!'),
        __('Sorry, but it seems that the chart you want to see is not quite ready for the world, yet. Why don\'t you just relax and wait a minute?'),
        false,
        404
    );
}


function error_chart_deleted() {
    error_page('chart',
        __('Too late'),
        __('Sorry, but it seems that the chart you want to see has already passed away because its author decided to delete it.'),
        false,
        404
    );
}


function error_not_allowed_to_publish() {
    error_page('chart',
        __('Whoops! You\'re not allowed to publish charts, yet'),
        __('Sorry, but it seems that your account is not ready to publish charts, yet.'),
        array(
            __('If you created the chart as a guest, you should <a href="#login">sign up for a free account</a> now. In case you already did that, you probably still need to activate you e-mail address by clicking on that activation link we sent you.')
        ),
        403
    );
}


function error_chart_not_found($id) {
    error_page('chart',
        __('Whoops! We couldn\'t find that chart..'),
        __('Sorry, but it seems that there is no chart with the id <b>'.$id.'</b> (anymore)'),
        false, 404
    );
}

function error_chart_not_writable() {
    error_page('chart',
        __('Whoops! That charts doesn\'t belong to you'),
        __('Sorry, but the requested chart belongs to someone else.'),
        array(
            __('Please check if you\'re logged in.')
        ),
        403
    );
}

function error_mycharts_need_login() {
    error_page('mycharts',
        __('Whoops! You need to be logged in.'),
        __('Good news is, sign up is free and takes less than 20 seconds.')
    );
}

function error_access_denied() {
    error_page('chart',
        __('Access denied.'),
        __('You need to be signed in.')
    );
}

function error_settings_need_login() {
    error_page('user',
        __('Whoops! You need to be logged in.'),
        __('Guess what, in order to edit your user profile, you need to either login or create yourself an account.')
    );
}

function error_invalid_password_reset_token() {
    error_page('user',
        __('Something went horribly wrong'),
        __('The password reset link you entered is invalid.'),
        array(
            __('Re-check the link you received in our email. Make sure you copied the full link and try again.'),
            __('Contact someone of our friendly <a href="mailto:hello@datawrapper.de">administrators</a> and ask for help with the password reset process.')
        )
    );
}

function error_mycharts_user_not_found() {
    error_page('mycharts',
        __('User not found!'),
        __('There is no user with the given user id.')
    );
}

