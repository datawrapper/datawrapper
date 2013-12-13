<?php

function check_chart_readable($id, $callback) {
    $chart = ChartQuery::create()->findPK($id);
    if ($chart) {
        $user = DatawrapperSession::getUser();
        if ($chart->isReadable($user) === true) {
            call_user_func($callback, $user, $chart);
        } else {
            // no such chart
            error_chart_not_writable();
        }
    } else {
        // no such chart
        error_chart_not_found($id);
    }
}

function check_chart_writable($id, $callback) {
    $chart = ChartQuery::create()->findPK($id);
    if ($chart) {
        $user = DatawrapperSession::getUser();
        if ($chart->isWritable($user) === true) {
            call_user_func($callback, $user, $chart);
        } else {
            // no such chart
            error_chart_not_writable();
        }
    } else {
        // no such chart
        error_chart_not_found($id);
    }
}

function check_chart_public($id, $callback) {
    $chart = ChartQuery::create()->findPK($id);
    if ($chart) {
        $user = $chart->getUser();
        if ($user->isAbleToPublish()) {
            if ($chart->isPublic()) {
                call_user_func($callback, $user, $chart);
            } else if ($chart->_isDeleted()) {
                error_chart_deleted();
            } else {
                error_chart_not_published();
            }
        } else {
            // no such chart
            error_not_allowed_to_publish();
        }
    } else {
        // no such chart
        error_chart_not_found($id);
    }
}


function check_chart_exists($id, $callback) {
    $chart = ChartQuery::create()->findPK($id);
    if ($chart) {
        call_user_func($callback, $chart);
    } else {
        // no such chart
        error_chart_not_found($id);
    }
}