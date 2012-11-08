<?php

/**
 * Datawrapper main index
 *
 */


// load YAML parser and config
require_once '../vendor/spyc/spyc.php';
$GLOBALS['dw_config'] = Spyc::YAMLLoad('../config.yaml');

if ($GLOBALS['dw_config']['debug'] == true) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

define('DATAWRAPPER_VERSION', '1.0.2');

// include datawrapper session serialization
require '../lib/session/Datawrapper.php';


// Require the Slim PHP 5 Framework
require '../vendor/Slim/Slim.php';

// Include the main Propel script
// Initialize Propel with the runtime configuration
// Add the generated 'classes' directory to the include path
require_once '../vendor/propel/runtime/lib/Propel.php';
Propel::init("../lib/core/build/conf/datawrapper-conf.php");
set_include_path("../lib/core/build/classes" . PATH_SEPARATOR . get_include_path());

// Load TwigView
require_once '../vendor/Slim-Extras/Views/TwigView.php';
TwigView::$twigDirectory = '../vendor/Twig';


$app = new Slim(array(
    'view' => new TwigView(),
    'templates.path' => '../templates'
));


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


function add_header_vars(&$page, $active = null) {
    // define the header links
    global $app;
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
    $headlinks[] = array('url' => '/docs', 'id' => 'about', 'title' => _('About'), 'icon' => 'info-sign');
    $headlinks[] = array('url' => 'http://blog.datawrapper.de', 'id' => 'blog', 'title' => _('Blog'), 'icon' => 'tag');

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
        )/*, array(
            'url' => '#lang-es-ES',
            'title' => 'Español'
        )*/),
        'title' => _('Language'),
        'icon' => 'font'
    );
    if ($user->isLoggedIn()) {
        $headlinks[] = array(
            'url' => '#user',
            'id' => 'user',
            'title' => $user->getEmail(),
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
    $page['DW_DOMAIN'] = $GLOBALS['dw_config']['domain'];
    $page['DW_VERSION'] = DATAWRAPPER_VERSION;
    $page['DW_CHART_CACHE_DOMAIN'] = $GLOBALS['dw_config']['chart_domain'];
    $page['ADMIN_EMAIL'] = $GLOBALS['dw_config']['admin_email'];
    if (isset($GLOBALS['dw_config']['piwik'])) {
        $page['PIWIK_URL'] = $GLOBALS['dw_config']['piwik']['url'];
        $page['PIWIK_IDSITE'] = $GLOBALS['dw_config']['piwik']['idSite'];
        if (isset($GLOBALS['dw_config']['piwik']['idSiteNoCharts'])) {
            $page['PIWIK_IDSITE_NO_CHARTS'] = $GLOBALS['dw_config']['piwik']['idSiteNoCharts'];
        }
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


