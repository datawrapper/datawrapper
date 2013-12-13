<?php

/*
 * init Twig extensions and hooks
 */

// Twig Extension to jsonify objects
$twig->addFilter('json', new Twig_Filter_Function('toJSON'));
function toJSON($arr) {
    return json_encode($arr);
}

// Twig Extension to clean HTML from malicious code
require_once ROOT_PATH . 'vendor/htmlpurifier/HTMLPurifier.standalone.php';

$config = HTMLPurifier_Config::createDefault();
$config->set('HTML.Allowed', 'a[href],p,b,div,span,strong,u,i,em,q,blockquote,*[style],br,small');
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

function has_hook($hook) {
    return DatawrapperHooks::getInstance()->hookRegistered($hook);
}
$twig->addFunction('has_hook', new Twig_Function_Function('has_hook'));

// loae I18n extension for Twig
$twig->addExtension(new Twig_Extension_I18n());

function has_plugin($plugin) {
    return DatawrapperPluginManager::loaded($plugin);
}
$twig->addFunction('has_plugin', new Twig_Function_Function('has_plugin'));
