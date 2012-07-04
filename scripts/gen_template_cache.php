<?php

// taken from http://twig.sensiolabs.org/doc/extensions/i18n.html#extracting-template-strings

require_once dirname(__FILE__) . '/../vendor/Twig/Autoloader.php';
Twig_Autoloader::register();

$tplDir = dirname(__FILE__) . '/../templates';
$tmpDir = dirname(__FILE__) . '/tmpl_cache/';
$loader = new Twig_Loader_Filesystem($tplDir);

// force auto-reload to always have the latest version of the template
$twig = new Twig_Environment($loader, array(
    'cache' => $tmpDir,
    'auto_reload' => true
));

// Twig Extension to convert strings to nice JavaScript class names, e.g. bar-chart --> BarChart
$twig->addFilter('classify', new Twig_Filter_Function('str_classify'));
function str_classify($s) {
    return preg_replace('/\s/', '', ucwords(preg_replace('/[_\-\.]/', ' ', $s)));
}
$twig->addFilter('json', new Twig_Filter_Function('toJSON'));
function toJSON($arr) {
    return json_encode($arr);
}

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
        file_put_contents($outPath, $compiled);
        unlink($cacheFile);
    }
}