<?php

/*
 * init Twig extensions and hooks
 */

function dwGetHTMLPurifier() {
    static $instance = null;

    if (!$instance) {
        // Twig Extension to clean HTML from malicious code
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'a[href],p,b,div,span,strong,u,i,em,q,blockquote,*[style],br,small');
        $config->set('Cache.SerializerPath', ROOT_PATH.'/tmp/');

        $instance = new HTMLPurifier($config);
    }

    return $instance;
}

function dwInitTwigEnvironment(Twig_Environment $twig) {
    $twig->setCache(ROOT_PATH.'/tmp/twig');
    $twig->enableAutoReload();
    $twig->addExtension(new Twig_I18n_Extension());

    $twig->addFilter(new Twig_SimpleFilter('purify', function($dirty) {
        return dwGetHTMLPurifier()->purify($dirty);
    }));

    $twig->addFilter(new Twig_SimpleFilter('json', function($arr) {
        $mask = 0;
        if (!empty($opts)) {
            if (!empty($opts['pretty'])) $mask = $mask | JSON_PRETTY_PRINT;
        }
        return json_encode($arr, $mask);
    }));

    $twig->addFilter(new Twig_SimpleFilter('css', function($arr) {
        $css = '';
        foreach ($arr as $prop => $val) {
            $css .= $prop . ':' . $val . ';';
        }
        return $css;
    }));

    $twig->addFunction(new Twig_SimpleFunction('hook', function() {
        call_user_func_array(array(DatawrapperHooks::getInstance(), 'execute'), func_get_args());
    }));

    $twig->addFunction(new Twig_SimpleFunction('has_hook', function($hook) {
        return DatawrapperHooks::getInstance()->hookRegistered($hook);
    }));

    $twig->addFunction(new Twig_SimpleFunction('has_plugin', function($plugin) {
        return DatawrapperPluginManager::loaded($plugin);
    }));

    $twig->addFilter(new Twig_SimpleFilter('lettering', function($text) {
        $out = '';
        foreach (str_split($text) as $i => $char) {
            $out .= '<span class="char'.$i.'">'.$char.'</span>';
        }
        return $out;
    }, array('is_safe' => array('html')) ));

    return $twig;
}
