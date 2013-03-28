<?php

/**
 * Datawrapper main index
 *
 */



define('DATAWRAPPER_VERSION', '1.2.6');  // must be the same as in package.json

define('ROOT_PATH', '../');

require_once '../lib/utils/check_server.php';
check_server();

require '../lib/bootstrap.php';

// Load twig instance
$twig = $app->view()->getEnvironment();

// Twig Extension to convert strings to nice JavaScript class names, e.g. bar-chart --> BarChart
$twig->addFilter('classify', new Twig_Filter_Function('str_classify'));
function str_classify($s) {
    return preg_replace('/\s/', '', ucwords(preg_replace('/[_\-\.]/', ' ', $s)));
}

// Twig Extension to jsonify objects
$twig->addFilter('json', new Twig_Filter_Function('toJSON'));
function toJSON($arr) {
    return json_encode($arr);
}

// Twig Extension to clean HTML from malicious code
require_once '../vendor/htmlpurifier/HTMLPurifier.standalone.php';
$config = HTMLPurifier_Config::createDefault();
$config->set('HTML.Allowed', 'a[href],p,b,strong,u,i,em,q,blockquote,*[style]');
$_HTMLPurifier = new HTMLPurifier($config);
$twig->addFilter('purify', new Twig_Filter_Function('str_purify'));

function str_purify($dirty_html) {
    global $_HTMLPurifier;
    return $_HTMLPurifier->purify($dirty_html);
}

// loae I18n extension for Twig
$twig->addExtension(new Twig_Extension_I18n());

require_once '../lib/utils/i18n.php';
require_once '../lib/utils/disable_cache.php';

// Load CDN publishing class
if (!empty($GLOBALS['dw_config']['publish']) && !empty($GLOBALS['dw_config']['publish']['requires'])) {
    foreach($GLOBALS['dw_config']['publish']['requires'] as $lib) {
        require_once '../' . $lib;
    }
}


function add_header_vars(&$page, $active = null) {
    // define the header links
    global $app;
    $config = $GLOBALS['dw_config'];
    if (!isset($active)) {
        $active = explode('/', $app->request()->getResourceUri());
        $active = $active[1];
    }

    $user = DatawrapperSession::getUser();
    $headlinks = array();
    $headlinks[] = array('url' => '/chart/create', 'id' => 'chart', 'title' => _('Create Chart'), 'icon' => 'pencil');
    if ($user->isLoggedIn() && $user->hasCharts()) {
        $headlinks[] = array('url' => '/mycharts/', 'id' => 'mycharts', 'title' => _('My Charts'), 'icon' => 'signal');
    } else {
        $headlinks[] = array('url' => '/gallery/', 'id' => 'gallery', 'title' => _('Gallery'), 'icon' => 'signal');
    }

    if (isset($config['navigation'])) foreach ($config['navigation'] as $item) {
        $link = array('url' => str_replace('%lang%', substr(DatawrapperSession::getLanguage(), 0, 2), $item['url']), 'id' => $item['id'], 'title' => _($item['title']));
        if (!empty($item['icon'])) $link['icon'] = $item['icon'];
        $headlinks[] = $link;
    }

    $headlinks[] = array(
        'url' => '',
        'id' => 'lang',
        'dropdown' => array(array(
            'url' => '#lang-de-DE',
            'title' => 'Deutsch'
        ), array(
            'url' => '#lang-en-GB',
            'title' => 'English'
        ), array(
            'url' => '#lang-fr-FR',
            'title' => 'Français'
        ), array(
            'url' => '#lang-es-ES',
            'title' => 'Español'
        )),
        'title' => _('Language'),
        'icon' => 'font'
    );
    if ($user->isLoggedIn()) {
        $shortenedMail = $user->getEmail();
        $shortenedMail = strlen($shortenedMail) > 18 ? substr($shortenedMail, 0, 9).'...'.substr($shortenedMail, strlen($shortenedMail)-9) : $shortenedMail;
        $headlinks[] = array(
            'url' => '#user',
            'id' => 'user',
            'title' => $shortenedMail,
            'icon' => 'user',
            'dropdown' => array(array(
                'url' => '/account/settings',
                'icon' => 'wrench',
                'title' => _('Settings')
            ), array(
                'url' => '#logout',
                'icon' => 'off',
                'title' => _('Logout')
            ))
        );
        if ($user->isAdmin()) {
            $headlinks[] = array(
                'url' => '/admin',
                'id' => 'admin',
                'icon' => 'fire',
                'title' => _('Admin')
            );
        }
    } else {
        $headlinks[] = array(
            'url' => '#login',
            'id' => 'login',
            'title' => _('Login / Sign Up'),
            'icon' => 'user'
        );
    }
    foreach ($headlinks as $i => $link) {
        $headlinks[$i]['active'] = $headlinks[$i]['id'] == $active;
    }
    $page['headlinks'] = $headlinks;
    $page['user'] = DatawrapperSession::getUser();
    $page['language'] = substr(DatawrapperSession::getLanguage(), 0, 2);
    $page['locale'] = DatawrapperSession::getLanguage();
    $page['DW_DOMAIN'] = $config['domain'];
    $page['DW_VERSION'] = DATAWRAPPER_VERSION;
    $page['DW_CHART_CACHE_DOMAIN'] = $config['chart_domain'];
    $page['ADMIN_EMAIL'] = $config['admin_email'];

    $analyticsMod = get_module('analytics', '../lib/');
    $page['trackingCode'] = !empty($analyticsMod) ? $analyticsMod->getTrackingCode() : '';

    if (isset($config['piwik'])) {
        $page['PIWIK_URL'] = $config['piwik']['url'];
        $page['PIWIK_IDSITE'] = $config['piwik']['idSite'];
        if (isset($config['piwik']['idSiteNoCharts'])) {
            $page['PIWIK_IDSITE_NO_CHARTS'] = $config['piwik']['idSiteNoCharts'];
        }
    }

    if ($config['debug']) {
        // parse git branch
        $head = file_get_contents('../.git/HEAD');
        $parts = explode("/", $head);
        $page['BRANCH'] = ' ('.trim($parts[count($parts)-1]).')';
    }
}


function add_editor_nav(&$page, $step) {
    // define 4 step navigation
    $steps = array();
    $steps[] = array('index'=>1, 'id'=>'upload', 'title'=>_('Upload Data'));
    $steps[] = array('index'=>2, 'id'=>'describe', 'title'=>_('Check & Describe'));
    $steps[] = array('index'=>3, 'id'=>'visualize', 'title'=>_('Visualize'));
    $steps[] = array('index'=>4, 'id'=>'publish', 'title'=>_('Publish & Embed'));
    $page['steps'] = $steps;
    $page['chartLocale'] = $page['locale'];
    $page['metricPrefix'] = get_metric_prefix($page['chartLocale']);
    $page['createstep'] = $step;
}


require_once '../lib/utils/errors.php';
require_once '../lib/utils/check_chart.php';
require_once '../lib/utils/get_module.php';
require_once '../controller/home.php';
require_once '../controller/account-settings.php';
require_once '../controller/account-activate.php';
require_once '../controller/account-reset-password.php';
require_once '../controller/chart-create.php';
require_once '../controller/chart-edit.php';
require_once '../controller/chart-upload.php';
require_once '../controller/chart-describe.php';
require_once '../controller/chart-visualize.php';
require_once '../controller/chart-data.php';
require_once '../controller/chart-preview.php';
require_once '../controller/chart-embed.php';
require_once '../controller/chart-publish.php';
require_once '../controller/chart-static.php';
require_once '../controller/mycharts.php';
require_once '../controller/xhr.php';
require_once '../controller/docs.php';
require_once '../controller/gallery.php';
require_once '../controller/admin.php';

$app->notFound(function() {
    error_not_found();
});


if ($GLOBALS['dw_config']['debug']) {
    $app->get('/phpinfo', function() use ($app) {
        phpinfo();
    });
}

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */

$app->run();


