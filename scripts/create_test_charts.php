<?php

/*
 * creates an large set of test charts in many different
 * combinations of datasets, visualizations and themes
 */

define('ROOT_PATH', '../');
define('NO_SLIM', 1);

require_once ROOT_PATH . 'lib/bootstrap.php';

require_once ROOT_PATH . 'lib/utils/themes.php';

date_default_timezone_set('Europe/Berlin');

// check if we already have a user 'tester'
$user = UserQuery::create()->findOneByEmail('test');
if ($user) {
    // remove existing charts
    $charts = ChartQuery::create()->filterByUser($user)->find();
    if ($charts) {
        foreach ($charts as $chart) {
            $chart->delete();
            $chart->save();
        }
    }
} else {
    // create test user
    $user = new User();
    $user->setEmail('test');
    $user->setPwd(rand());
    $user->setRole('editor');
    $user->setCreatedAt(time());
    $user->save();
    print 'created new user "test"...'."\n";
}

$themes = get_themes_meta();


foreach (glob("test-charts/*.json") as $test) {
    $config = json_decode(file_get_contents($test), true);
    $data = $config['_data'];
    unset($config['_data']);
    unset($config['id']);

    foreach ($themes as $theme) {
        $chart = new Chart();
        $chart->setId(ChartQuery::create()->getUnusedRandomId());
        $chart->setUser($user);
        $chart->unserialize($config);
        $chart->writeData($data);
        $chart->setTheme($theme['id']);
        $chart->save();
    }
}

print "To see the charts, please visit\n";
print 'http://' . $GLOBALS['dw_config']['domain'] . '/admin/charts/' . $user->getId()."\n";