<?php

function check_chart($id, $callback) {
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