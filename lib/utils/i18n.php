<?php


function get_metric_prefix($locale) {
    switch (substr($locale, 0, 2)) {
        case 'de':
            $pre = array();
            $pre[3] = ' Tsd.';
            $pre[6] = ' Mio.';
            $pre[9] = ' Mrd.';
            $pre[12] = ' Bio.';
            return $pre;
        default:
            $pre = array();
            $pre[3] = 'k';
            $pre[6] = 'm';
            $pre[9] = 'b';
            $pre[12] = 't';
            return $pre;
    }
}

