<?php

/*
 * Pagination
 */

function add_pagination_vars(&$page, $total, $curPage, $perPage, $append = '') {
    $pgs = array();
    $p_min = 0;
    $p_max = $lastPage = floor($total / $perPage);

    if ($curPage == 0) $p_max = min($lastPage, $curPage + 4);
    else if ($curPage == 1) $p_max = min($lastPage, $curPage + 3);
    else $p_max = min($lastPage, $curPage + 2);

    if ($curPage == $lastPage) $p_min = max(0, $curPage - 4);
    else if ($curPage == $lastPage-1) $p_min = max(0, $curPage - 3);
    else $p_min = max(0, $curPage - 2);

    for ($p = $p_min; $p <= $p_max; $p++) $pgs[] = $p;

    $page['pager'] = array(
        'pages' => $pgs,
        'first' => 0,
        'current' => $curPage,
        'last' => floor($total / $perPage),
        'append' => $append
    );
}