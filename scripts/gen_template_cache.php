<?php

define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
define('NO_SLIM', 1);

require_once ROOT_PATH . 'lib/bootstrap.php';
require_once ROOT_PATH . 'lib/utils/themes.php';
require_once ROOT_PATH . 'vendor/Twig/Autoloader.php';
require_once  ROOT_PATH . 'vendor/htmlpurifier/HTMLPurifier.standalone.php';

date_default_timezone_set('Europe/Berlin');

// taken from http://twig.sensiolabs.org/doc/extensions/i18n.html#extracting-template-strings

Twig_Autoloader::register();

$tplDir = ROOT_PATH . 'templates';
$tmpDir = ROOT_PATH . 'scripts/tmpl_cache/';
$tmpDirPlugins = ROOT_PATH . 'scripts/tmpl_cache/plugins/';
$loader = new Twig_Loader_Filesystem($tplDir);

// force auto-reload to always have the latest version of the template
$twig = new Twig_Environment($loader, array(
    'cache' => $tmpDir,
    'auto_reload' => true
));

if (!file_exists($tmpDirPlugins)) mkdir($tmpDirPlugins);

// Twig Extension to convert strings to nice JavaScript class names, e.g. bar-chart --> BarChart
$twig->addFilter('classify', new Twig_Filter_Function('str_classify'));
function str_classify($s) {
    return preg_replace('/\s/', '', ucwords(preg_replace('/[_\-\.]/', ' ', $s)));
}
$twig->addFilter('json', new Twig_Filter_Function('toJSON'));
function toJSON($arr) {
    return json_encode($arr);
}

// Twig Extension to clean HTML from malicious code
$config = HTMLPurifier_Config::createDefault();
$config->set('HTML.Allowed', 'a[href],p,b,strong,u,i,em,q,blockquote,*[style]');
$_HTMLPurifier = new HTMLPurifier($config);
$twig->addFilter('purify', new Twig_Filter_Function('str_purify'));

function str_purify($dirty_html) {
    global $_HTMLPurifier;
    return $_HTMLPurifier->purify($dirty_html);
}

function call_hook() {
    call_user_func_array(array(DatawrapperHooks::getInstance(), 'execute'), func_get_args());
}
$twig->addFunction('hook', new Twig_Function_Function('call_hook'));


// loae I18n extension for Twig
$twig->addExtension(new Twig_Extension_I18n());

// iterate over all your templates
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($tplDir), RecursiveIteratorIterator::LEAVES_ONLY) as $file)
{
    if (substr($file, -5) == ".twig") {
        // force compilation
        $tmplPath = str_replace($tplDir.'/', '', $file);
        $twig->loadTemplate($tmplPath);
        $cacheFile = $twig->getCacheFilename($tmplPath);
        $compiled = file_get_contents($cacheFile);
        $outPath = $tmpDir . str_replace("/", "__", $tmplPath).".php";
        if (substr($tmplPath, 0, 8) == 'plugins/') {
            $outPath = $tmpDirPlugins . str_replace("/", "__", substr($tmplPath, 8)).".php";
        }
        file_put_contents($outPath, $compiled);
        unlink($cacheFile);
    }
}