<?php

/*
 * delete expired products
 * (once per minute is enough)
 */
DatawrapperHooks::register(DatawrapperHooks::CRON_MINUTELY, function() {
    Propel::getConnection()
       ->exec('DELETE FROM user_product WHERE expires IS NOT NULL AND expires <= NOW()');
});


/*
 * fix redirects for recently published charts with high version numbers
 * (once per minute is enough)
 */
DatawrapperHooks::register(DatawrapperHooks::CRON_DAILY, function() {
    $charts = ChartQuery::create()
        ->filterByPublishedAt(['min'=>date('Y-m-d H:i:s', strtotime('-1 day -1 hour'))])
        ->filterByPublicVersion(['min'=>20])
        ->find();

    foreach ($charts as $chart) {
        $chart->redirectPreviousVersions(false);
    }
});


